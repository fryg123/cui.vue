<template>
    <i-select v-if="editor.type==='select'" :val="selectVal" @update:val="setVal" :multiple="editor.multiple" :tree="editor.tree" :options="editor.data" :taggable="editor.taggable" dropdown-parent="root" />
    <input v-else :type="editor.type" :value="value" v-on:input="$emit('input',$event.target.value)" class="form-control" />
</template>
<script>
export default {
    props: {
        value: {
            default: null
        },
        editor: {
            default: {}
        }
    },
    data() {
        return {
            selectVal: null,
            valueType: 'String'
        };
    },
    methods: {
        setVal(val) {
            this.$emit('input', val);
        }
    },
    created: function () {
        if (this.value instanceof Array) {
            this.valueType = 'Array';
            this.selectVal = this.value.join(',');
        } else {
            this.selectVal = this.value;
        }
    }
};
</script>