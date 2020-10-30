<template>
  <Modal
    :value="ModelToggle"
    :title="ModalOption.title"
    :closable="false"
    @on-ok="confirm"
    @on-visible-change="visibleChange"
  >
    <Row>
      <Col span="6"
        ><Upload
          ref="upload"
          :show-upload-list="false"
          :on-success="uploadSuccess"
          :on-error="uploadError"
          :headers="headers"
          :before-upload="handleBeforeUpload"
          :accept="ModalOption.accept"
          :max-size="ModalOption.maxSize"
          :on-exceeded-size="handleMaxSize"
          :multiple="ModalOption.multiple"
          :data="ModalOption.data"
          :action="ModalOption.baseUrl + ModalOption.uploadUrl"
        >
          <Button icon="ios-cloud-upload-outline">上传文件</Button>
        </Upload></Col
      >
      <Col span="18">{{ fileName }}</Col>
    </Row>
    <Row style="margin-top:20px;position:relative;" v-if="loading">
      <Spin
        ><Tag color="warning"
          >文件上传中 ! 请不要关闭弹窗，耐心等待...</Tag
        ></Spin
      >
      <div style="margin:50px;position:relative;">
        <Spin fix size="large"></Spin>
      </div>
    </Row>
    <Row style="margin-top:20px;">
      <Col v-if="ModalOption.templateUrl" span="24"
        ><a @click="linkDownload(ModalOption.templateUrl)">{{
          ModalOption.templateName
        }}</a></Col
      >
      <Col v-if="errorExcelUrl" span="24">
        <a
          @click="linkDownload(errorExcelUrl)"
          style="color:#f44"
          :title="errorExcelUrl"
          >查看错误上传信息</a
        >
      </Col>
      <Col v-if="ModalOption.errorUrl" span="24"
        >导入完成，部分导入失败，<a @click="linkDownload(ModalOption.errorUrl)"
          >下载失败数据</a
        ></Col
      >
      <Col v-if="ModalOption.describe" span="24">{{
        ModalOption.describe
      }}</Col>
    </Row>
  </Modal>
</template>

<script>
import {Modal} from 'view-design'
import {getToken} from '../libs/util'
export default {
  name: 'ImportModal',
  components: {
    Modal
  },
  props: {
    ModelToggle: {
      // 显示、隐藏
      type: Boolean,
      default: false
    },
    ModalOption: {
      /**
       * @name ModalOption
       * {
       *  title:'导入',//标题
       *  format:['jpg', 'jpeg', 'png'],//文件上传格式
       *  maxSize:1024,//上传文件大小限制
       *  multiple:false,//是否上传多个文件
       *  templateUrl:,//模板链接
       *  templateName:'',//模板名称
       *  uploadUrl:'/file-api/uploadFile',//上传接口链接
       *  baseUrl: '/oscs-api'  代理转发链接
       *  tokenKey
       * }
       */
      type: Object,
      required: true
    }
  },
  computed: {
    headers() {
      return {
        'GATEWAY-TOKEN': this.getTokens()
      }
    }
  },
  data() {
    return {
      fileName: '',
      fileUrl: '',
      loading: false,
      errorExcelUrl: ''
    }
  },
  watch: {
    ModelToggle(value) {
      if (value) {
        this.fileName = ''
        this.fileUrl = ''
        this.errorExcelUrl = ''
      }
    }
  },
  mounted() {},
  methods: {
    getTokens() {
      return getToken(this.ModalOption.tokenKey)
    },
    handleMaxSize(file) {
      this.$Notice.warning({
        title: '超出文件大小限制',
        desc: String(file.name) + ' 文件大小超出限制, 请不要超过2M.'
      })
    },
    handleBeforeUpload() {
      this.loading = true
      return true
    },
    uploadSuccess(res, file) {
      this.loading = false
      if (res.code === '0') {
        let reg = /部分失败/g

        if (reg.test(res.msg)) {
          this.succMsg(
            '导入完成，部分数据调拨条件不足，可前往任务中心下载查看异常数据'
          )
        } else {
          this.succMsg('文件上传成功')
        }
        if (res.content) {
          if (res.content.errorCount == null) {
            //   上传数据成功
            this.errorExcelUrl = ''
          } else if (res.content.errorCount > 0) {
            //   上传数据异常
            this.errorExcelUrl = res.content.errorExcelUrl
          }
        }

        this.fileName = file.name
        this.fileUrl = res.content
        this.$emit('getFailData', res)
      } else {
        this.failMsg(res.msg)
      }
    },
    uploadError(error, file, fileList) {
      this.loading = false
      this.failMsg(error)
    },
    visibleChange(value) {
      if (!value) {
        this.$emit('modalvisibleChange', false) // 父组件接收
      }
    },
    linkDownload(url) {
      window.open(url, '_blank') // 新窗口打开外链接
    },
    confirm() {
      this.$emit('uploadFileSuccess', this.fileUrl) // 父组件接收
    }
  }
}
</script>

<style lang="less"></style>
