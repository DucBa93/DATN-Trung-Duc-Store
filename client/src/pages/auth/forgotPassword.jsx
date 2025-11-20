import React, { useState } from 'react'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import axios from 'axios'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Vui lòng nhập email!')
      return
    }

    try {
      setLoading(true)
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email })
      if (res.data.success) {
        toast.success(res.data.message || 'Email khôi phục mật khẩu đã được gửi!')
      } else {
        toast.error(res.data.message || 'Gửi yêu cầu thất bại!')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra, thử lại sau!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Quên mật khẩu</h1>
          <p className="mt-2 text-gray-500">
            Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
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
            {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
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

export default ForgotPassword
