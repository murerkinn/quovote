<template lang='pug'>
  form(v-else @submit.prevent="$emit('sendQuestion', { name, question })")
    h2 Ask the speaker
    a-textarea(
      placeholder='Type your question',
      :autoSize='{ minRows: 2, maxRows: 6 }',
      :maxLength='280',
      v-model='question'
    )
    a-input(placeholder='Your name (optional)', v-model='name', :maxLength='40')
    a-button(type='primary', @click="$emit('sendQuestion', { name, question })" :loading='loading', icon='message') Send
</template>

<script>
export default {
  name: 'askTheSpeakerForm',
  data() {
    return {
      name: undefined,
      question: ''
    }
  },
  props: ['loading']
}
</script>

<style lang='scss' scoped>
form > * {
  margin: 8px 0 !important;
}

textarea {
  padding: 8px;
}
</style>