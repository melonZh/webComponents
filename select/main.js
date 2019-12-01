// 声明一个 MelonSelect 类

class MelonSelect extends HTMLElement {
  // 监听属性变化
  static get observedAttributes() {
    return ['list', 'placeholder', 'onfocus']
  }

  constructor() {
    // 必须首先调用 super 方法
    super();
    
    // 元素的功能代码写在这里
    // 获取 template 节点
    const templateElem = document.getElementById('melonSelect');
    // 获取<template>节点以后，克隆了它的所有子元素，这是因为可能有多个自定义元素的实例，这个模板还要留给其他实例使用，所以不能直接移动它的子元素。
    const content = templateElem.content.cloneNode(true);
    // Web Component 允许内部代码隐藏起来，这叫做 Shadow DOM，即这部分 DOM 默认与外部 DOM 隔离，内部任何代码都无法影响外部
    const shadowRoot = this.attachShadow({mode: 'open'});
    // 将 template 节点加入 shadowDom
    shadowRoot.appendChild(content);

    // 设置对应的属性
    this._wrapperDom = null // 整个 select .melon-select-wrapper
    this._listDom = null // 下拉选项 list
    this._titleDom = null // 选中的 value 展示的 title .melon-select-title-wrapper
    this._arrowFlip = false // 下拉框选项显示
    this._value = null // 选中的 value
    this._name = null // 选中的 name 用于设置
    this._placeholder = null //
    this._defultValue = null //
  }
  // 当自定义元素第一次被连接到文档DOM时被调用
  connectedCallback() {
    this._wrapperDom = this.shadowRoot.querySelector('.melon-select-wrapper')
    this._listDom = this.shadowRoot.querySelector('.melon-select-list-wrapper')
    this._titleDom = this.shadowRoot.querySelector('.melon-select-title-wrapper')
    this._defultValue = this.getAttribute('defultValue')
    this._value = this.getAttribute('value')
    this._onfocus = this.getAttribute('onfocus')
    this._placeholder = this.getAttribute('placeholder')
    this.setPlaceholder()
    this.initEvent()
  }
  // disconnectedCallback 当自定义元素与文档DOM断开连接时被调用
  disconnectedCallback() {
    this._wrapperDom.removeEventListener('click', this.flipArrow.bind(this))
    this._wrapperDom.removeEventListener('blur', this.blurWrapper.bind(this))

    this.shadowRoot.querySelectorAll('.melon-select-list-item')
      .forEach((item, index) => {
        item.removeEventListener('click', this.change.bind(this, index))
      })
  }
  // adoptedCallback 当自定义元素被移动到新文档时被调用。
  adoptedCallback() {

  }
  // attributeChangedCallback 当自定义元素的一个属性被增加、移除或更改时被调用。
  attributeChangedCallback(attr, oldVal, newVal) {
    console.log('我被修改了===> ', attr, oldVal, newVal)
    if (attr === 'list') {
      this.render(JSON.parse(newVal))
    }
  }

  initEvent() {
    this.initArrowEvent()
    this.blurWrapper()
  }

  initOnFocusEvent() {
    const onfocusFunc = this.getAttribute('onfocus')
    this._onfocus = onfocusFunc
    console.log('typeof', typeof onfocusFunc)
    this._wrapperDom.addEventListener('focus', onfocusFunc())
  }


  initArrowEvent() {
    this._wrapperDom.addEventListener('click', this.flipArrow.bind(this))
  }

  initChangeEvent() {
    this.shadowRoot.querySelectorAll('.melon-select-list-item')
      .forEach((item, index) => {
        item.addEventListener('click', this.change.bind(this, index))
      })
  }

  change(index) {
    this.changeTitle(this._list, index)

    let changeInfo = {
      detail: {
        value: this._value,
        name: this._name
      },
      bubbles: true
    }
    let changeEvent = new CustomEvent('change', changeInfo)
    this.dispatchEvent(changeEvent)
  }

  changeTitle(list, index) {
    if (list.length) {
      this._value = list[index].value
      this._name = list[index].name
      this._titleDom.innerText = this._name
    }
  }

  setPlaceholder() {
    if(!this._defultValue && !this._value) {
      this._titleDom.innerText = this._placeholder
    }
  } 

  flipArrow() {
    if (!this._arrowFlip) {
      this.showList()
    } else {
      this.hideList()
    }
  }

  showList() {
    this._arrowFlip = true
    this._wrapperDom.classList = 'melon-select-wrapper flip'
  }

  hideList() {
    this._arrowFlip = false
    this._wrapperDom.classList = 'melon-select-wrapper'
  }

  blurWrapper() {
    this._wrapperDom.addEventListener('blur', (event) => {
      event.stopPropagation()
      this.hideList()
    })
  }

  render(list) {
    if (!list instanceof Array) return
    let listString = ''
    this._list=list
    if (list.length) {
      list.forEach((item) => {
        listString += `
          <div class="melon-select-list-item" data-value="${item.value}">${item.name}</div>
        `
      })
    } else {
      listString = '<p>暂无数据</p>'
    }
    this._listDom.innerHTML = listString
    this.initChangeEvent()
  }


}

// 使用 CustomElementRegistry.define() 方法注册新自定义元素 ，并向其传递要定义的元素名称、指定元素功能的类、以及可选的其所继承自的元素。
window.customElements.define('melon-select', MelonSelect)