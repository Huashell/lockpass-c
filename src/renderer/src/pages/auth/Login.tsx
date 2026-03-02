import { UserSetInfo } from '@common/entitys/app.entity'
import { webToManMsg } from '@common/entitys/ipcmsg.entity'
import { PagePath } from '@common/entitys/page.entity'
import { LastUserInfo, RegisterInfo, User } from '@common/entitys/user.entity'
import { ConsoleLog } from '@renderer/libs/Console'
import { useHistory } from '@renderer/libs/router'
import { GetAllUsers, ipc_call, ipc_call_normal, UpdateMenu } from '@renderer/libs/tools/other'
import { AppStore, use_appstore } from '@renderer/models/app.model'
import { use_appset } from '@renderer/models/appset.model'
import { AutoComplete, AutoCompleteProps, Button, Form, Input, InputRef, message } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useEffect, useRef, useState } from 'react'
interface RegisterInfo2 extends RegisterInfo {
  password_repeat: string
}

export default function Register(): JSX.Element {
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = useForm<RegisterInfo2>()
  const history = useHistory()
  const [options, setOptions] = useState<AutoCompleteProps['options']>([])
  const [lastUser, setLastUser] = useState<User>(null)
  const appstore = use_appstore() as AppStore
  const isReigster = history.PathName == PagePath.register
  const isLogin = history.PathName == PagePath.Login
  const isLock = history.PathName == PagePath.Lock
  ConsoleLog.info('register render', history.PathName, isLogin, isLock)
  const getText = use_appset((state) => state.getText)
  const firstInputRef = useRef<InputRef>(null)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [biometricLoading, setBiometricLoading] = useState(false)

  useEffect(() => {
    initData()
    if (firstInputRef.current && isLock) {
      firstInputRef.current.focus()
    }
  }, [])

  async function initData() {
    await GetAllUsers(appstore, getText, messageApi)
    await ipc_call<LastUserInfo>(webToManMsg.GetLastUserInfo)
      .then((res) => {
        setLastUser(res.user)
        // 检查 Touch ID 是否可用且已启用
        if (isLock && res.user) {
          const userset = res.user.user_set as UserSetInfo
          if (userset.normal_biometric_unlock) {
            ipc_call_normal<boolean>(webToManMsg.CheckBiometricAvailable).then((available) => {
              setBiometricAvailable(available)
            })
          }
        }
      })
      .catch((e) => {
        ConsoleLog.error('GetLastUserInfo', e)
      })
  }
  useEffect(() => {
    setOptions(
      appstore.user_list.map((user) => {
        return { value: user.username, label: user.username }
      })
    )
  }, [appstore.user_list])

  async function OnRegister() {
    form.validateFields().then(async (values) => {
      if (values.password_repeat !== values.password) {
        message.error(getText('auth.login.password_not_match'))
        return
      }
      await ipc_call<null>(webToManMsg.Register, values)
        .then(() => {
          history.replace(PagePath.Login)
        })
        .catch((err) => {
          messageApi.error(getText(`err.${err.code}`))
        })
    })
  }

  async function onLogin() {
    form.validateFields().then(async (values) => {
      if (!values.username) {
        values.username = lastUser?.username
      }
      const user = await ipc_call<User>(webToManMsg.Login, values).catch((error) => {
        messageApi.error(getText(`err.${error.code}`))
      })
      if (user) {
        message.success(getText('auth.login.success'))
        appstore.Login(user)
        await UpdateMenu(appstore, getText)
        if (isLock) {
          history.go(-1)
        } else {
          history.replace(PagePath.Home)
          const setinfo = user.user_set as UserSetInfo
          if (setinfo.normal_autoupdate) {
            await ipc_call(webToManMsg.checkUpdateAuto)
          }
        }
      }
    })
  }

  async function onBiometricUnlock() {
    setBiometricLoading(true)
    try {
      const user = await ipc_call<User>(webToManMsg.BiometricUnlock)
      if (user) {
        message.success(getText('biometric.unlock.success'))
        appstore.Login(user)
        await UpdateMenu(appstore, getText)
        history.go(-1)
      }
    } catch (e: any) {
      ConsoleLog.error('BiometricUnlock error', e)
      messageApi.error(getText('biometric.unlock.fail'))
    } finally {
      setBiometricLoading(false)
    }
  }

  return (
    <div className=" bg-slate-100">
      {contextHolder}
      <div className=" fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
        <div className="flex flex-col items-center">
          <div className=" text-4xl text-black mb-3 font-bold font-sans">
            {isReigster
              ? getText('register.title')
              : isLogin
                ? getText('auth.login.title')
                : getText('auth.lock.title')}
          </div>
          <Form form={form} layout="vertical" onFinish={() => {}}>
            {(isReigster || isLogin) && (
              <Form.Item label={getText('auth.login.account')} required name="username">
                <AutoComplete
                  autoFocus
                  options={options}
                  placeholder={getText('auth.login.placeholder.account')}
                />
              </Form.Item>
            )}
            <Form.Item label={getText('auth.login.main_password')} name="password" required>
              <Input.Password
                ref={firstInputRef}
                placeholder={getText('auth.login.placeholder.main_password')}
                size="large"
              />
            </Form.Item>
            {isReigster && (
              <Form.Item
                label={getText('auth.login.main_password_repeat')}
                name="password_repeat"
                required
              >
                <Input.Password
                  placeholder={getText('auth.login.placeholder.main_password_repeat')}
                  size="large"
                />
              </Form.Item>
            )}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full"
                onClick={async () => {
                  if (isReigster) {
                    await OnRegister()
                  } else {
                    await onLogin()
                  }
                }}
              >
                {getText('ok')}
              </Button>
            </Form.Item>
            {isLock && biometricAvailable && (
              <Form.Item>
                <Button
                  className="w-full"
                  loading={biometricLoading}
                  onClick={onBiometricUnlock}
                  icon={
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ marginRight: 4 }}>
                      <path d="M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28zM3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.25.16.22.11.54-.12.7-.23.16-.54.11-.7-.12-.9-1.26-2.04-2.25-3.39-2.94-2.87-1.47-6.54-1.47-9.4.01-1.36.7-2.5 1.7-3.4 2.96-.08.14-.23.21-.39.21zm6.25 12.07c-.13 0-.26-.05-.35-.15-.87-.87-1.34-1.43-2.01-2.64-.69-1.23-1.05-2.73-1.05-4.34 0-2.97 2.54-5.39 5.66-5.39s5.66 2.42 5.66 5.39c0 .28-.22.5-.5.5s-.5-.22-.5-.5c0-2.42-2.09-4.39-4.66-4.39-2.57 0-4.66 1.97-4.66 4.39 0 1.44.32 2.77.93 3.85.64 1.15 1.08 1.64 1.85 2.42.19.2.19.51 0 .71-.11.1-.24.15-.37.15zm7.17-1.85c-1.19 0-2.24-.3-3.1-.89-1.49-1.01-2.38-2.65-2.38-4.39 0-.28.22-.5.5-.5s.5.22.5.5c0 1.41.72 2.74 1.94 3.56.71.48 1.54.71 2.54.71.24 0 .64-.03 1.04-.1.27-.05.53.13.58.41.05.27-.13.53-.41.58-.57.11-1.07.12-1.21.12zM14.91 22c-.04 0-.09-.01-.13-.02-4.91-1.31-7.78-6.04-7.78-9.64 0-2.42 2.09-4.39 4.66-4.39 2.57 0 4.66 1.97 4.66 4.39 0 1.83-1.64 3.32-3.66 3.32s-3.66-1.49-3.66-3.32c0-1.27 1.19-2.31 2.66-2.31 1.47 0 2.66 1.04 2.66 2.31 0 .74-.69 1.35-1.55 1.35-.66 0-1.04-.45-1.04-.95 0-.28.22-.5.5-.5s.5.22.5.5c0 .01 0 0 .01-.01.13-.03.08-.15.08-.34 0-.19-.4-.81-1.16-.81-.92 0-1.16.63-1.16 1.31 0 1.28 1.19 2.32 2.66 2.32 1.47 0 2.66-1.04 2.66-2.32 0-1.87-1.64-3.39-3.66-3.39-2.02 0-3.66 1.52-3.66 3.39 0 3.18 2.59 7.54 7.02 8.71.27.07.42.35.35.61-.05.23-.26.38-.47.38z" />
                    </svg>
                  }
                >
                  {getText('biometric.unlock')}
                </Button>
              </Form.Item>
            )}
            {isLogin && (
              <Button
                className="w-full"
                onClick={() => {
                  history.replace(PagePath.register)
                }}
              >
                {getText('auth.login.gotoRegister')}
              </Button>
            )}
            {isReigster && (
              <Button
                className="w-full mt-2"
                onClick={() => {
                  history.push(PagePath.Login)
                }}
              >
                {getText('register.skiptoLogin')}
              </Button>
            )}
          </Form>
        </div>
      </div>
    </div>
  )
}
