<template>
  <span class="datepicker">
    <span class="control has-addons flatpickr" ref="pickrInput" v-if="isWrap">
      <input class="input form-control"
             :name="name"
             :placeholder="placeholder"
             type="text"
             v-model="interVal" data-input>
      <a class="button" data-toggle><i class="fa fa-calendar"></i></a>
      <a class="button" data-clear><i class="fa fa-close"></i></a>
    </span>
    <div class="control has-icon has-icon-right" v-else>
      <input class="form-control" :name="name" :value="interVal" :placeholder="placeholder" type="text" v-model="interVal" ref="pickrInput">
      <i class="fa fa-calendar"></i>
      <i class="fa fa-times" @click.prevent="handleClear"></i>
    </div>
  </span>
</template>
<script>
import Flatpickr from 'flatpickr';
import { zh } from 'flatpickr/dist/l10n/zh';// eslint-disable-line

export default {
  props: {
    options: {
      type: Object,
      default() { },
    },
    name: String,
    placeholder: String,
    val: String,
    value: {}
  },

  data() {
    return {
      interVal: this.value,
      flatPickr: null,
    };
  },

  computed: {
    isWrap() {
      if (this.options) {
        return !!this.options.wrap;
      }
      return false;
    },
  },

  methods: {
    changeVal() {
      this.$emit('input', this.interVal);
    },
    handleClear() {
      this.flatPickr && this.flatPickr.clear();
    },
  },

  watch: {
    interVal(val) {
      this.interVal = val;
      this.$emit('input', this.interVal);
    },
  },

  mounted() {
    const pickrEl = this.$refs.pickrInput;
    Flatpickr.localize(zh);
    this.flatPickr = new Flatpickr(pickrEl, this.options);
  },

  beforeDestroy() {
    if (this.flatPickr) {
      this.flatPickr.destroy();
      this.flatPickr = null;
    }
  },
};
</script>
