import CommonForm from '@/components/common/form'
import { registerFormControls } from '@/config'
import { registerUser } from '@/store/auth-slice'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from "sonner"


const initialState = {
  userName: '',
  email:'',
  password:'',
  confirmPassword: ''
}
const register = () => {
  const [formData, setFormData] = useState(initialState)
  const dispatch = useDispatch()
  const navigate = useNavigate()


  function onSubmit (event){
    event.preventDefault();
    if (formData.password !== formData.confirmPassword) {
    toast.error("Mật khẩu xác nhận không khớp!", {
      classNames: {
        toast: 'bg-red-600 text-white',
      },
    });
    return; // Dừng lại, không gửi request
  }
    dispatch(registerUser(formData)).then((data)=> {
      
      if (data?.payload?.success ){
        toast.success("Đăng ký thành công !")
        navigate("/auth/login")
      } else {
        toast.error(data?.payload?.message, {
          classNames: {
          toast: 'bg-red-600 text-white',
        }})

      }
  
    })
  }
  
  return (
    <div className='mx-auto w-full max-w-md space-y-6'>
      <div className='text-center'>
        <h1 className='text-3xl font-bold tracking-tight text-foreground'>Tạo tài khoản mới</h1>
        <p className='mt-2'>
            Bạn đã có tài khoản ?
            <Link className='font-medium ml-2 text-primary hover:!underline' to={'/auth/login'}>
              Đăng nhập            
            </Link>
        </p>
      </div>
      <CommonForm 
        formControls={registerFormControls}
        buttonText={'Đăng ký'}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
    </div>
  )
}

export default register
