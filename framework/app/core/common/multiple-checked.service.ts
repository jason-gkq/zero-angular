import { Injectable } from '@angular/core';

@Injectable()

export class SelectedInfo {
    list: Array<any>;           // 获取当前页面处理后的列表数据
    allChecked: boolean;        // 当前页的全选标志状态
    checkedCount: number;       // 选中总条数
    checkedStore: Array<any>;   // 选中数据的id集合
    checkedList: Array<any>;    // 选中list
}

@Injectable()
export class MultipleCheckedService {
    // 记录选中数据
    private checkedStore = new Set();
    // 记录全选状态
    private allChecked = false;

    /**
     * 处理选中事件
     * @param displayList
     * @param item
     */
    handleCheckedEvent(displayList, item) {
        let changeFlag;
        let changeList;
        if (typeof item === 'boolean') {
            // 全选
            changeFlag = item;
            changeList = displayList;
        } else {
            // 单个选择
            changeFlag = item.checked;
            changeList = [item];
        }
        this.updateCheckedStore(changeFlag, changeList);
    }

    /**
     * 更新checkedStore
     * @param {boolean} changeFlag
     * @param {Array<any>} changeList
     */
    private updateCheckedStore(changeFlag: boolean, changeList: Array<any>) {
        changeList.forEach(item => {
            if (!item.disabled) {
                if (changeFlag) {
                    if (!Array.from(this.checkedStore).find((store: any) => {
                        return store.id === item.id;
                    })) {
                        this.checkedStore.add(item);
                    }
                } else {
                    let storeItem = item;
                    this.checkedStore.forEach((st: any) => {
                        if (st.id === item.id) {
                            storeItem = st;
                            return;
                        }
                    });
                    this.checkedStore.delete(storeItem);
                }
            } else {
                this.checkedStore.delete(item);
            }
        });
    }

    /**
     * 返回选中数据（id）
     * @returns {any}
     */
    private getCheckedStore() {
        return Array.from(this.checkedStore).map((item: any) => {
            return item.id;
        });
    }

    /**
     * 返回选中list
     */
    private getCheckedList() {
        return Array.from(this.checkedStore);
    }

    /**
     * 返回当前的数据状态 checked
     * @returns {any}
     */
    private getDisplayUpdatedList(displayList) {
        const displayUpdatedList = [];
        let count = 0;
        let disabledCount = 0;
        displayList.forEach(item => {
            let hasFlag = false;
            this.checkedStore.forEach((st: any) => {
                if (st.id === item.id) {
                    hasFlag = true;
                    return;
                }
            });
            if (item.disabled) {
                disabledCount++;
                item.checked = false;
            } else {
                if (hasFlag) {
                    count++;
                    item.checked = true;
                } else {
                    item.checked = false;
                }
            }
            displayUpdatedList.push(item);
        });
        if (count === 0 || displayList.length === 0) {
            this.allChecked = false;
        } else {
            displayList.length === count + disabledCount ? this.allChecked = true : this.allChecked = false;
        }
        return displayUpdatedList;
    }

    /**
     * 获取选中条数
     * @returns {number}
     */
    private getCheckedCount() {
        return this.getCheckedStore().length;
    }

    /**
     * 返回当页选中状态
     * @returns {boolean}
     */
    private getAllChecked() {
        return this.allChecked;
    }

    /**
     * 清空所选
     */
    clearChecked() {
        this.checkedStore = new Set<any>();
        this.allChecked = false;
    }

    /**
     * 获取选中信息
     * @returns {SelectedInfo}
     */
    getSelectedInfo(displayList): SelectedInfo {
        return <SelectedInfo>{
            list: this.getDisplayUpdatedList(displayList),
            allChecked: this.getAllChecked(),
            checkedCount: this.getCheckedCount(),
            checkedStore: this.getCheckedStore(),
            checkedList: this.getCheckedList()
        };
    }

    /**
     * 设置clearCheckedStore
     */
    setCheckedStore(checkedStore) {
        this.checkedStore = checkedStore;
    }
}
