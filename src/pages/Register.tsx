// src/pages/Register.tsx
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, UserPlus } from 'lucide-react';


const schema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Enter a valid email' }),
  phone: z.string().min(10, { message: 'Phone number is required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const registerUser = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    await registerUser(data);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-amber-100/50 p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-white" style={{ display: 'block' }} />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-amber-700">Start taking notes today</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Name */}
              <div className="relative group">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-400" style={{ display: 'block', zIndex: 10 }} />
                <input
                  {...register('name')}
                  placeholder="Name"
                  className="w-full pl-12 pr-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white/60 backdrop-blur-sm hover:bg-white/80"
                />
              </div>
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}

              {/* Email */}
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-400" style={{ display: 'block', zIndex: 10 }} />
                <input
                  {...register('email')}
                  placeholder="Email"
                  className="w-full pl-12 pr-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white/60 backdrop-blur-sm hover:bg-white/80"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

              {/* Phone */}
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-400" style={{ display: 'block', zIndex: 10 }} />
                <input
                  {...register('phone')}
                  placeholder="Phone"
                  className="w-full pl-12 pr-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white/60 backdrop-blur-sm hover:bg-white/80"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}

              {/* Password */}
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-400" style={{ display: 'block', zIndex: 10 }} />
                <input
                  {...register('password')}
                  type="password"
                  placeholder="Password"
                  className="w-full pl-12 pr-4 py-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white/60 backdrop-blur-sm hover:bg-white/80"
                />
              </div>
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            >
              Register
            </button>
          </form>

          <div className="text-center">
            <p className="text-amber-700">
              Already have an account?{' '}
              <Link
                to="/"
                className="text-amber-600 hover:text-amber-700 font-medium hover:underline transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}