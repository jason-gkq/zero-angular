import { Component, EventEmitter, Output, OnInit, Input } from '@angular/core';

@Component({
  selector: 'lcb-security-code',
  templateUrl: './lcb-security-code.component.html',
  styleUrls: ['./lcb-security-code.component.less']
})

export class LcbSecurityCodeComponent implements OnInit {
    @Input()
    set refresh(refresh) {
        this.extendJQ();
    }
  @Output()
  code = new EventEmitter();
  checkCode;
  interval;

  constructor () {}

  ngOnInit() {
    this.interval = setInterval(() => {
        this.checkCode = document.querySelector('#data_code');
        if (this.checkCode) {
            clearInterval(this.interval);
            this.extendJQ();
        }
    });
  }

  codeChange(code) {
    this.code.emit(code);
  }

  extendJQ(o = {codeLength: 5}) {
    const that = this;
    const checkCode = this.checkCode;
    const options = {
      code_l: o.codeLength,   // 验证码长度
      codeChars: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
      ],
      codeColors: ['#f44336', '#009688', '#cddc39', '#03a9f4', '#9c27b0', '#5e4444', '#9ebf9f', '#ffc8c4', '#2b4754', '#b4ced9', '#835f53', '#aa677e'],
      code_Init: function() {
        let code = '';
        let codeColor = '';
        for (let i = 0; i < this.code_l; i++) {
            const charNum = Math.floor(Math.random() * 52);
            code += this.codeChars[charNum];
        }
        for (let i = 0; i < this.codeColors.length; i++) {
            const charNum = Math.floor(Math.random() * 12);
            codeColor = this.codeColors[charNum];
        }
        if (checkCode) {
            that.codeChange(code);
            checkCode['style'].color = codeColor;
            checkCode.className = 'code';
            checkCode.innerHTML = code;
            checkCode.setAttribute('data-value', code);
        }
      }
    };
    options.code_Init();    // 初始化验证码
  }
}
