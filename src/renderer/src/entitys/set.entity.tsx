import { Select, Switch } from 'antd'
import { FieldInfo, FiledProps } from './form.entity'
import TimeSelect from '@renderer/components/TimeSelect'
import { webToManMsg } from '@common/entitys/ipcmsg.entity'
import { ipc_call_normal } from '@renderer/libs/tools/other'

export const NormalSetFiledList: FieldInfo[] = [
  {
    field_name: 'normal_autolock_time',
    render: (props: FiledProps) => {
      return <TimeSelect {...props} />
    },
    edit_rules: [{ required: true, message: '请输入自动锁定时间' }]
  },
  {
    field_name: 'normal_lock_with_pc',
    render: (props: FiledProps) => {
      return <Switch {...props} />
    }
  },
  {
    field_name: 'normal_biometric_unlock',
    render: (props: FiledProps) => {
      return (
        <BiometricSwitch {...props} />
      )
    }
  },
  {
    field_name: 'normal_autoupdate',
    render: (props: FiledProps) => {
      return <Switch {...props} />
    }
  },
  {
    field_name: 'normal_poweron_open',
    render: (props: FiledProps) => {
      return <Switch {...props} />
    }
  },
  {
    field_name: 'normal_lang_set',
    render: (props: FiledProps) => {
      return (
        <Select {...props}>
          <Select.Option value="zh-cn">简体中文</Select.Option>
          <Select.Option value="en-us">English</Select.Option>
        </Select>
      )
    }
  }
]

function BiometricSwitch(props: FiledProps) {
  const { value, onChange, ...rest } = props
  const [available, setAvailable] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    ipc_call_normal<boolean>(webToManMsg.CheckBiometricAvailable).then((res) => {
      setAvailable(res)
    })
  }, [])

  useEffect(() => {
    setChecked(!!value)
  }, [value])

  if (!available) return null

  const handleChange = async (val: boolean) => {
    if (val) {
      await ipc_call_normal(webToManMsg.EnableBiometric)
    } else {
      await ipc_call_normal(webToManMsg.DisableBiometric)
    }
    setChecked(val)
    onChange?.(val)
  }

  return <Switch {...rest} checked={checked} onChange={handleChange} />
}

import { useState, useEffect } from 'react'

export enum SetMenuItem {
  normal = 'normal',
  shortcut_global = 'shortcut_global',
  shortcut_local = 'shortcut_local'
}
