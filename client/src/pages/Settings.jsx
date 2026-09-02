import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/useAuth.js';

const emptyPasswordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function Settings() {
  const { token, user, updateUser } = useAuth();
  const [account, setAccount] = useState({ email: user?.email || '', phone: user?.phone || '' });
  const [accountMessage, setAccountMessage] = useState('');
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    let active = true;

    const loadAccount = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/account', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (active) {
          setAccount({ email: response.data.user.email, phone: response.data.user.phone || '' });
          updateUser(response.data.user);
        }
      } catch {
        if (active) setAccountMessage('Unable to load account information. Please try again.');
      } finally {
        if (active) setLoadingAccount(false);
      }
    };

    loadAccount();
    return () => { active = false; };
  }, [token, updateUser]);

  const saveAccount = async (event) => {
    event.preventDefault();
    setSavingAccount(true);
    setAccountMessage('');
    try {
      const response = await axios.put('http://localhost:5000/api/auth/account', account, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccount({ email: response.data.user.email, phone: response.data.user.phone || '' });
      updateUser(response.data.user);
      setAccountMessage('Account information saved.');
    } catch (error) {
      setAccountMessage(error.response?.data?.msg || 'Unable to save account information.');
    } finally {
      setSavingAccount(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setPasswordMessage('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage('New password and confirmation must match.');
      return;
    }

    setSavingPassword(true);
    try {
      const response = await axios.put('http://localhost:5000/api/auth/password', passwordForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPasswordForm(emptyPasswordForm);
      setPasswordMessage(response.data.msg);
    } catch (error) {
      setPasswordMessage(error.response?.data?.msg || 'Unable to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const messageClass = (message) => message.includes('saved') || message.includes('successfully')
    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
    : 'bg-red-50 border-red-200 text-red-700';

  return (
    <div className="app-page min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-10 lg:py-14">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:underline mb-7">
          <span aria-hidden="true">←</span> Back to Dashboard
        </Link>
        <div className="mb-9">
          <p className="text-xs font-bold tracking-[.16em] text-gray-500">ACCOUNT SETTINGS</p>
          <h1 className="text-4xl font-bold mt-2">Settings</h1>
          <p className="text-gray-500 mt-2">Manage your account details and keep your ProjectHub workspace secure.</p>
        </div>

        <div className="grid gap-6">
          <section className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-7 shadow-lg">
            <div className="flex items-start gap-3 mb-6">
              <span className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 grid place-items-center font-bold">01</span>
              <div><h2 className="text-xl font-bold">Account information</h2><p className="text-sm text-gray-500 mt-1">Keep your email address and contact number up to date.</p></div>
            </div>
            {loadingAccount ? <p className="text-sm text-gray-500">Loading account information…</p> : (
              <form onSubmit={saveAccount} className="grid sm:grid-cols-2 gap-5">
                <label className="block text-sm font-semibold text-gray-700">Email address
                  <input type="email" value={account.email} onChange={(event) => setAccount({ ...account, email: event.target.value })} required className="w-full mt-2 p-3 border" />
                </label>
                <label className="block text-sm font-semibold text-gray-700">Phone number
                  <input type="tel" value={account.phone} onChange={(event) => setAccount({ ...account, phone: event.target.value })} placeholder="Add a phone number" className="w-full mt-2 p-3 border" />
                </label>
                {accountMessage && <p className={`sm:col-span-2 border rounded-xl px-3 py-2 text-sm ${messageClass(accountMessage)}`}>{accountMessage}</p>}
                <div className="sm:col-span-2"><button type="submit" disabled={savingAccount} className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-60">{savingAccount ? 'Saving…' : 'Save account information'}</button></div>
              </form>
            )}
          </section>

          <section className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-7 shadow-lg">
            <div className="flex items-start gap-3 mb-6">
              <span className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 grid place-items-center font-bold">02</span>
              <div><h2 className="text-xl font-bold">Change password</h2><p className="text-sm text-gray-500 mt-1">Use at least six characters and verify your current password.</p></div>
            </div>
            <form onSubmit={changePassword} className="grid gap-5 max-w-xl">
              <label className="block text-sm font-semibold text-gray-700">Current password<input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} required className="w-full mt-2 p-3 border" /></label>
              <label className="block text-sm font-semibold text-gray-700">New password<input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} minLength="6" required className="w-full mt-2 p-3 border" /></label>
              <label className="block text-sm font-semibold text-gray-700">Confirm new password<input type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} minLength="6" required className="w-full mt-2 p-3 border" /></label>
              {passwordMessage && <p className={`border rounded-xl px-3 py-2 text-sm ${messageClass(passwordMessage)}`}>{passwordMessage}</p>}
              <div><button type="submit" disabled={savingPassword} className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-60">{savingPassword ? 'Updating…' : 'Update password'}</button></div>
            </form>
          </section>

          <section className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-7 shadow-lg">
            <div className="flex items-start gap-3">
              <span className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 grid place-items-center font-bold">03</span>
              <div><h2 className="text-xl font-bold">Help &amp; Support</h2><p className="text-gray-500 mt-2 leading-relaxed">Need help with ProjectHub? If you have any questions, issues, or feedback, please contact us.</p><a href="mailto:anshikabhatt011@gmail.com" className="inline-block mt-3 text-indigo-600 font-semibold hover:underline">anshikabhatt011@gmail.com</a></div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
