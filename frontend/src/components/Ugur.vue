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
    addTrigger() {
      const keys = this.form.getFieldValue('keys')

      this.form.setFieldsValue({
        keys: [...keys, keys.length++]
      })

      this.triggers = [...this.triggers, '']
    },
    removeTrigger({ index }) {
      const keys = this.form.getFieldValue('keys')

      if (!keys.length) return

      this.form.setFieldsValue({
        keys: keys.splice(index, 1)
      })

      this.triggers.splice(index, 1)
    },
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
  beforeCreate() {
    this.form = this.$form.createForm(this, { name: 'dynamic_form_item' })
    this.form.getFieldDecorator('keys', { initialValue: [], preserve: true })
  },
  beforeDestroy() {
    this.recognition.removeEventListener('result', this.handleVoiceTrigger)
    this.recognition.removeEventListener('end', this.recognition.start)

    this.recognition.stop()
  }
}
</script>

<template lang="pug">
  #ugur
    a-form(:form="form")
      a-form-item.ugur-form-item(
        v-for="(trigger, triggerIndex) in triggers"
        :key="triggerIndex"
      )
        a-input(v-decorator="[`names[${triggerIndex}]`,{validateTrigger: ['change', 'blur'],rules:[{message: 'some message'}]}]" @change="(e) => handleTriggerChange(triggerIndex, e.target.value)" style="width: 85%;")
        a-button.ugur-action.left(@click="() => removeTrigger({index: triggerIndex})")
          a-icon(type="minus")
    a-button.ugur-action.first(@click="handleMoveOn") Done, move on
    a-button.ugur-action(@click="handleVoiceActivation") Activate: Voice-Action
    a-button.ugur-action(@click="addTrigger") Add new word
</template>

<style>
.ugur-action {
  margin-left: 1rem;
}

.ugur-action.first {
  margin: 0;
}
</style>
