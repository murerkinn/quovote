<script>
import { mapState, mapActions } from 'vuex'

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

export default {
  data() {
    return {
      triggers: [''],
      lang: 'tr-TR',
      speechRecognitionInstance: window.SpeechRecognition && new window.SpeechRecognition()
    }
  },
  computed: {
    ...mapState('event', ['event'])
  },
  props: ['pinLatestQuestion'],
  methods: {
    ...mapActions('event', ['archiveQuestion']),
    handleVoiceActivation() {
      const { speechRecognitionInstance } = this

      speechRecognitionInstance.lang = this.lang

      try {
        speechRecognitionInstance.start()
      } catch (error) {
        console.warn('Speech recognition API is already started.')
      }

      speechRecognitionInstance.addEventListener('result', this.handleVoiceTrigger)
      speechRecognitionInstance.addEventListener('end', speechRecognitionInstance.start)
    },
    handleMoveOn() {
      const getLastPinnedQuestion = () => this.event.questions?.find(question => question.isPinned)

      if (!getLastPinnedQuestion()) return

      this.archiveQuestion({
        action: 'archive',
        questionId: getLastPinnedQuestion()._id
      })

      if (getLastPinnedQuestion()) return

      this.pinLatestQuestion()
    },
    handleVoiceTrigger(e) {
      const transcript = Array.from(e.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('')
        .replace(new RegExp(/ı|I|İ/g), 'i')
        .toLowerCase()

      const isTriggered = this.triggers.some(trigger => trigger && transcript.includes(trigger))

      if (isTriggered) this.handleMoveOn()
    },
    handleTextArea(e) {
      this.triggers = e.target.value.split('\n').filter(v => v)
    },
    handleTriggerChange(triggerIndex, value) {
      this.triggers.splice(triggerIndex, 1, value)
    }
  },
  beforeDestroy() {
    const { speechRecognitionInstance } = this

    if (!speechRecognitionInstance) return

    speechRecognitionInstance.removeEventListener('result', this.handleVoiceTrigger)
    speechRecognitionInstance.removeEventListener('end', speechRecognitionInstance.start)

    speechRecognitionInstance.stop()
  }
}
</script>

<template lang="pug">
  #director
    a-textarea(
      placeholder='Enter trigger phrases (each line represents a trigger)'
      :autoSize='{ minRows: 5 }'
      @input="handleTextArea"
    )
    #director-actions
      a-button.director-action.first(@click="handleMoveOn") Done, move on
      a-button.director-action(@click="handleVoiceActivation" :disabled="!speechRecognitionInstance") Activate: Voice-Action
</template>

<style scoped>
#director-actions {
  margin-top: 1.5rem;
}

.director-action {
  margin-left: 1rem;
}

.director-action.first {
  margin: 0;
}
</style>
