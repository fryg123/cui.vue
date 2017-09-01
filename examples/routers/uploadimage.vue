<template>
    <div>
        <p>请选择图片：</p>
        <uploadimage v-on:err="showError" />
        <div v-show="err">验证错误：<span v-html="err"></span></div>
    </div>
</template>
<script>
    export default {
        data () {
            return {
                err: ''
            };
        },
        mounted () {

        },
        methods: {
            showError (err) {
                this.err = err;
            }
        }
    }
</script>