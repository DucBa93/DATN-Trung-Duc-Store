import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import axios from 'axios'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password || !confirmPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin!')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!')
      return
    }

    try {
      setLoading(true)
      const res = await axios.post(`/api/auth/reset-password/${token}`, { password })
      if (res.data.success) {
        toast.success(res.data.message || 'Đặt lại mật khẩu thành công!')
        navigate('/auth/login')
      } else {
        toast.error(res.data.message || 'Đặt lại mật khẩu thất bại!')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra, thử lại sau!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Đặt lại mật khẩu</h1>
          <p className="mt-2 text-gray-500">
            Nhập mật khẩu mới của bạn
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Mật khẩu mới</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Xác nhận mật khẩu</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold 
              ${loading ? 'bg-gray-400' : 'bg-primary hover:bg-primary/90'} transition`}
          >
            {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
          </button>
        </form>

        <div className="text-center text-gray-500 mt-2">
          <Link to="/auth/login" className="text-primary hover:underline font-medium">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
