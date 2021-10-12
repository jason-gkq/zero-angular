export class ErrorMsgModel {
  private _result;
  private _desc;
  private _el;

  get el() {
    return this._el;
  }

  set el(value) {
    this._el = value;
  }

  get result() {
    return this._result;
  }

  set result(value) {
    this._result = value;
  }

  get desc() {
    return this._desc;
  }

  set desc(value) {
    this._desc = value;
  }
}
