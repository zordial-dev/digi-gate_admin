import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Phone, ShieldCheck, UserPlus, CheckSquare, Square, KeyRound } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, verifyOtp } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Super Admin');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // OTP Verification state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Empty', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2 || score === 3) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-[#035352]' };
  };

  const strength = getPasswordStrength(password);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Valid email is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!termsAccepted) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await register({ fullName, email, phone, password, role });
      setRegisteredEmail(res.email || email);
      if (res.devOtp) setDevOtpHint(res.devOtp);
      showToast('OTP Dispatched', `A 6-digit OTP code has been sent to ${res.email || email}.`, 'info');
      setShowOtpModal(true);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Registration failed.';
      showToast('Registration Error', msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      showToast('OTP Required', 'Please enter the valid 6-digit OTP code sent to your email.', 'error');
      return;
    }

    setOtpLoading(true);
    try {
      await verifyOtp(registeredEmail, otpCode);
      showToast('Verification Successful', 'Account verified! Welcome to Digi-Gate Admin Panel.', 'success');
      setShowOtpModal(false);
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'OTP verification failed.';
      showToast('Verification Error', msg, 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <>
      <AuthLayout
        title="Create Admin Account"
        subtitle="Register a new administrative user to manage system gates and access controls."
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="Jane Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            leftIcon={<UserIcon className="w-4 h-4 text-slate-400" />}
            error={errors.fullName}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="jane@digigate.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              error={errors.email}
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+1 (555) 019-2834"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
              error={errors.phone}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#172525] tracking-wide uppercase">Admin Role</label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 py-3 text-sm text-[#172525] focus:outline-none focus:border-[#035352] focus:ring-2 focus:ring-[#035352]/20"
              >
                <option value="Super Admin">Super Admin (Full Rights)</option>
                <option value="System Admin">System Admin</option>
                <option value="Security Manager">Security Manager</option>
                <option value="Auditor">Auditor (Read Only)</option>
              </select>
            </div>
          </div>

          <Input
            label="Password"
            isPassword
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            error={errors.password}
          />

          {password && (
            <div className="flex flex-col gap-1 -mt-1">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                <span>Password Strength:</span>
                <span className="font-bold text-[#035352]">{strength.label}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                <div className={`h-full flex-1 transition-all ${strength.score >= 1 ? strength.color : 'bg-slate-200'}`} />
                <div className={`h-full flex-1 transition-all ${strength.score >= 2 ? strength.color : 'bg-slate-200'}`} />
                <div className={`h-full flex-1 transition-all ${strength.score >= 3 ? strength.color : 'bg-slate-200'}`} />
              </div>
            </div>
          )}

          <Input
            label="Confirm Password"
            isPassword
            placeholder="••••••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            error={errors.confirmPassword}
          />

          <div className="flex flex-col gap-1 my-1">
            <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
              <button
                type="button"
                onClick={() => setTermsAccepted(!termsAccepted)}
                className="text-[#035352] mt-0.5 focus:outline-none"
              >
                {termsAccepted ? (
                  <CheckSquare className="w-4 h-4 fill-[#035352] text-white" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
              </button>
              <span>
                I agree to the <span className="text-[#035352] font-semibold underline">Terms & Security Guidelines</span>.
              </span>
            </label>
            {errors.terms && <p className="text-xs text-rose-500 font-medium ml-6">{errors.terms}</p>}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            rightIcon={<UserPlus className="w-4 h-4" />}
            className="mt-2"
          >
            Create Admin Account
          </Button>

          <div className="text-center mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
            Already have an admin account?{' '}
            <Link to="/login" className="font-bold text-[#035352] hover:underline">
              Login
            </Link>
          </div>
        </form>
      </AuthLayout>

      {/* OTP Verification Modal */}
      <Modal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        title="Email OTP Verification"
      >
        <form onSubmit={handleVerifyOtpSubmit} className="space-y-4 my-2">
          <p className="text-xs text-slate-600">
            Please enter the 6-digit OTP code sent to <strong className="text-[#035352]">{registeredEmail}</strong>.
          </p>

          {devOtpHint && (
            <div className="p-3 bg-[#F3E8BC]/30 border border-[#F3E8BC] rounded-xl text-xs text-[#172525] font-mono flex items-center justify-between">
              <span>Dev OTP Code:</span>
              <strong className="text-[#035352] font-bold text-sm tracking-wider">{devOtpHint}</strong>
            </div>
          )}

          <Input
            label="Enter 6-Digit OTP"
            type="text"
            placeholder="123456"
            maxLength={6}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            leftIcon={<KeyRound className="w-4 h-4 text-slate-400" />}
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowOtpModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={otpLoading}>
              Verify & Complete Registration
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Register;
