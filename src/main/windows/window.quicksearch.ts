import AppModel from '@main/models/app.model'
import { WindowBase } from './window.base'
import { renderViewType } from '@common/entitys/app.entity'
import { MainToWebMsg } from '@common/entitys/ipcmsg.entity'
import { screen } from 'electron'
import robot from 'robotjs_addon'

export class QuickSearchWindow extends WindowBase {
  constructor() {
    super(renderViewType.Quickview)
    this.url = 'quick.html'
    this.haveFrame = false
    // macOS 上 type:'toolbar' 创建的 NSPanel 会绑定到首次激活时的窗口层级，
    // 导致切换应用后搜索框仍出现在之前的窗口上。改用普通窗口类型。
    this.wintype = process.platform === 'darwin' ? 'normal' : 'toolbar'
    this.resizeable = false
    this.click_outsize_close = true
    this.witdth = 600
    this.height = 50
    this.initWin()
    // macOS 普通窗口需要手动跳过 Dock/任务栏显示
    if (process.platform === 'darwin') {
      this.win.setSkipTaskbar(true)
    }
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
    AppModel.getInstance().setLastPoint(robot.getMousePos())
    this.win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
    this.win.setAlwaysOnTop(true, 'pop-up-menu')
    this.win.showInactive()
    // macOS 上 showInactive 不聚焦窗口，需要延迟 focus webContents 让输入框获得焦点
    if (process.platform === 'darwin') {
      setTimeout(() => {
        this.win.webContents.focus()
      }, 50)
    }
    this.win.webContents.send(MainToWebMsg.WindowsShow)
  }

  override hide(): void {
    this.win.setAlwaysOnTop(false)
    this.win.setVisibleOnAllWorkspaces(false)
    super.hide()
  }
}
