<template>
    <div>
        <p>请选择文件：</p>
        <UploadFile v-on:err="showError" :max="3" :maxLength="5120" tooltip="请选择文档类型的文件。" />
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