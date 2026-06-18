"use client";

import { useState } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    nik: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const [confirmPassword, setConfirmPassword] = useState("");

const [showPassword, setShowPassword] = useState(false);

const [showConfirmPassword, setShowConfirmPassword] =
  useState(false);

  function update(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(form.email)) {
  setError("Format email tidak valid");
  setLoading(false);
  return;
}

if (form.password.length < 8) {
  setError("Password minimal 8 karakter");
  setLoading(false);
  return;
}

if (form.password !== confirmPassword) {
  setError("Password dan Konfirmasi Password tidak sama");
  setLoading(false);
  return;
}

if (form.nik && !/^\d{16}$/.test(form.nik)) {
  setError("NIK harus 16 digit");
  setLoading(false);
  return;
}

if (
  form.phone &&
  !/^08[0-9]{8,11}$/.test(form.phone)
) {
  setError("Nomor HP tidak valid");
  setLoading(false);
  return;
}

    try {
      const formBody = new URLSearchParams();
      formBody.append("full_name", form.full_name.trim());
      formBody.append("username", form.username.trim());
      formBody.append("email", form.email.trim());
      formBody.append("password", form.password.trim());
      formBody.append("nik", form.nik.trim());
      formBody.append("phone", form.phone.trim());
      formBody.append("address", form.address.trim());

      const res = await fetch("/api/proxy/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody.toString(),
      });

      // Antisipasi jika server mengembalikan status code non-200 (seperti 422 atau 500)
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || errData.errors?.join(" ") || `Error: Status ${res.status}`);
        return;
      }

      const data = await res.json();

      // Cek status sukses dari API Yii2 Anda
      // Catatan: Pastikan endpoint API register di Yii2 Anda mengembalikan properti { success: true } saat berhasil.
      if (data.success === false) {
      // 🟢 Cetak seluruh isi respons dari server Yii2 ke Console Browser
        console.log("=== DEBUG REGISTER GAGAL ===");
        console.log("Respons Server:", data);
        console.log("Detail Validasi/Errors:", data.errors);
        console.log("=============================");

        setError(data.message || data.errors?.join(" ") || "Gagal register");
        return;
      }

      // Jika berhasil, bersihkan form dan arahkan ke login
      router.push("/login");

    } catch (err: any) {
      // 1. Ini akan muncul di Inspect Element Browser kamu
      console.error("Detail Error Register di Browser:", err);

      // 2. Trik agar muncul di terminal npm run dev:
      // Kirim data error tersebut ke endpoint internal Next.js bawaan untuk logger (jika ada), 
      // atau cara termudahnya, pastikan kamu melihat Tab Network di Inspect Element.
      setError(err?.message || "Tidak dapat terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="form-wrap">
        <h1>Register Akun</h1>
        <p>Daftarkan petani / user baru</p>

        <form onSubmit={handleSubmit}>
          <input name="full_name" placeholder="Nama Lengkap" onChange={update} required />
          <input name="username" placeholder="Username" onChange={update} required />
          <input name="email" placeholder="Email" onChange={update} required />
          <div className="password-group">
  <input
    name="password"
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    onChange={update}
    required
  />

  <button
    type="button"
    className="eye-btn"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>
</div>
<div className="password-group">

<input
type={
showConfirmPassword
? "text"
: "password"
}
placeholder="Konfirmasi Password"
value={confirmPassword}
onChange={(e)=>
setConfirmPassword(e.target.value)
}
required
/>

<button
type="button"
className="eye-btn"
onClick={()=>
setShowConfirmPassword(
!showConfirmPassword
)
}
>

{showConfirmPassword ? (
<EyeOff size={18}/>
) : (
<Eye size={18}/>
)}

</button>

</div>

          <hr style={{ margin: "20px 0" }} />

          <input name="nik" placeholder="NIK" onChange={update} />
          <input name="phone" placeholder="No HP" onChange={update} />
          <textarea name="address" placeholder="Alamat" onChange={update} />

          {error && <p style={{ color: "red", fontSize: "13px", marginTop: "5px" }}>⚠️ {error}</p>}

          <button disabled={loading} style={{ marginTop: "10px" }}>
            {loading ? "Loading..." : "Register"}
          </button>
        </form>

        <p style={{ marginTop: 15 }}>
          Sudah punya akun?{" "}
          <button onClick={() => router.push("/login")} style={{ width: "auto", display: "inline", padding: 0, background: "none", color: "#10b981", fontWeight: "bold", cursor: "pointer" }}>
            Login
          </button>
        </p>
      </div>

      <style jsx>{`
        .form-wrap {
          width: 100%;
          max-width: 420px;
        }
        h1 {
          font-size: 28px;
          color: #065f46;
        }
        p {
          color: #64748b;
          margin-bottom: 20px;
        }
        input,
        textarea {
          width: 100%;
          padding: 10px;
          margin-bottom: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }
        button {
          width: 100%;
          padding: 12px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
        }
        button:disabled {
          opacity: 0.6;
        }
          .password-group {
  position: relative;
  margin-bottom: 12px;
}

.password-group input {
  padding-right: 45px;
  margin-bottom: 0;
}

.eye-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  width: auto;
  padding: 0;
  cursor: pointer;
  color: #64748b;
}

.eye-btn:hover {
  color: #10b981;
}
      `}</style>
    </AuthLayout>
  );
  
}
