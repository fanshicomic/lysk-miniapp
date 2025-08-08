// component/svg.js
const fs = wx.getFileSystemManager();

import { Base64 } from './base64.js';
const base64 = new Base64();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    src: {
      type: String,
      value: '',
    },
    color: {
      type: String,
      value: '#000000',
    },
    width: {
      type: String,
      value: '20px',
    },
    height: {
      type: String,
      value: '20px',
    },
  },

  observers: {
    'src,color': function (src, color) {
      this.getSvgFile(src, color);
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    svgData: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getSvgFile(src, color) {
      let that = this;
      fs.readFile({
        filePath: src,
        encoding: 'binary',
        position: 0,
        success(res) {
          let sourceFile = res.data;
          let newFile = that.changeColor(sourceFile, color);
          let svgBase64File = base64.encode(newFile);
          that.setData({
            svgData: 'data:image/svg+xml;base64,' + svgBase64File,
          });
        },
        fail(res) {
          console.error(res);
        },
      });
    },

    changeColor(sourceFile, color) {
      let newSvg;
      if (/fill=".*?"/.test(sourceFile)) {
        newSvg = sourceFile.replace(/fill=".*?"/g, `fill="${color}"`); // SVG有默认色
      } else {
        newSvg = sourceFile.replace(/<svg /g, `<svg fill="${color}" `); // 无默认色
      }
      return newSvg;
    },
  },
});
