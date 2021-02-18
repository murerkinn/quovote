<script>
import { mapState, mapActions } from 'vuex'

export default {
  data() {
    return {
      triggers: [''],
      lang: 'tr-TR'
    }
  },
  computed: {
    ...mapState('event', ['event'])
  },
  props: ['recognition', 'pinLatestQuestion'],
  methods: {
    ...mapActions('event', ['archiveQuestion']),
    handleVoiceActivation() {
      const { recognition } = this

      if (!recognition) return console.error('Your browser is not supporting speech recognition api')

      recognition.lang = this.lang

      try {
        recognition.start()
      } catch (error) {
        console.warn('Speech recognition API is already started.')
      }

      recognition.addEventListener('result', this.handleVoiceTrigger)
      recognition.addEventListener('end', recognition.start)
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
    this.recognition.removeEventListener('result', this.handleVoiceTrigger)
    this.recognition.removeEventListener('end', this.recognition.start)

    this.recognition.stop()
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
      a-button.director-action(@click="handleVoiceActivation") Activate: Voice-Action
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
