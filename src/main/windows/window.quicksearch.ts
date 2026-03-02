import AppModel from '@main/models/app.model'
import { WindowBase } from './window.base'
import { renderViewType } from '@common/entitys/app.entity'
import { screen } from 'electron'

export class QuickSearchWindow extends WindowBase {
  constructor() {
    super(renderViewType.Quickview)
    this.url = 'quick.html'
    this.haveFrame = false
    this.wintype = 'toolbar'
    this.resizeable = false
    this.click_outsize_close = true
    this.witdth = 600
    this.height = 50
    this.initWin()
  }

  lockapp(): void {
    this.hide()
  }

  show(): void {
    if (AppModel.getInstance().IsLock()) {
      AppModel.getInstance().mainwin?.showInactive()
      return
    }
    // 将窗口定位到鼠标光标附近
    const cursorPoint = screen.getCursorScreenPoint()
    const display = screen.getDisplayNearestPoint(cursorPoint)
    const { width: screenW, height: screenH, x: screenX, y: screenY } = display.workArea
    let winX = cursorPoint.x - Math.floor(this.witdth / 2)
    let winY = cursorPoint.y - this.height - 10
    // 确保窗口不超出屏幕边界
    if (winX < screenX) winX = screenX
    if (winX + this.witdth > screenX + screenW) winX = screenX + screenW - this.witdth
    if (winY < screenY) winY = cursorPoint.y + 10
    if (winY + this.height > screenY + screenH) winY = screenY + screenH - this.height
    this.win.setBounds({ x: winX, y: winY, width: this.witdth, height: this.height })
    this.showInactive()
  }

  override hide(): void {
    this.win.setAlwaysOnTop(false)
    super.hide()
  }
}
