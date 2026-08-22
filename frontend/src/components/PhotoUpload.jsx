/**
 * PhotoUpload : upload d'avatar vers Supabase Storage.
 *
 * Features :
 * - Drag & drop OU clic pour sélectionner
 * - Preview immédiate avant upload
 * - Compression côté client (canvas, max 800x800)
 * - Upload vers bucket 'avatars' dans Supabase Storage
 * - Path format : {user_id}/{timestamp}.webp
 *
 * Usage :
 *   <PhotoUpload
 *     currentUrl={profile.avatar_url}
 *     onUploaded={(url) => setValue('avatar_url', url)}
 *     userId={user.id}
 *   />
 */

import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

const MAX_DIMENSION = 800
const BUCKET_NAME = 'avatars'

async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        // Redimensionne en gardant les proportions
        if (width > height) {
          if (width > MAX_DIMENSION) {
            height = (height * MAX_DIMENSION) / width
            width = MAX_DIMENSION
          }
        } else {
          if (height > MAX_DIMENSION) {
            width = (width * MAX_DIMENSION) / height
            height = MAX_DIMENSION
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Compression failed'))
              return
            }
            resolve(blob)
          },
          'image/webp',
          0.85
        )
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

export default function PhotoUpload({ currentUrl, onUploaded, userId, fullName = '' }) {
  const fileRef = useRef(null)
  const [preview, setPreview] = useState(currentUrl || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'

  const handleFile = async (file) => {
    setError(null)

    // Validation
    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image trop lourde (max 5 MB)')
      return
    }

    // Preview immédiate
    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)

    setUploading(true)
    try {
      // Compression
      const compressed = await compressImage(file)

      // Upload vers Supabase Storage
      const timestamp = Date.now()
      const filePath = `${userId}/${timestamp}.webp`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, compressed, {
          contentType: 'image/webp',
          upsert: true,
        })

      if (uploadError) throw uploadError

      // Récupère l'URL publique
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl

      // Met à jour l'état parent
      setPreview(publicUrl)
      onUploaded(publicUrl)
    } catch (err) {
      console.error('[PhotoUpload] Error:', err)
      setError(err.message || 'Erreur lors de l\'upload')
      setPreview(currentUrl || null) // rollback preview
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    if (!currentUrl) {
      setPreview(null)
      return
    }
    // Supprime le fichier de Supabase Storage (best-effort)
    try {
      const url = new URL(currentUrl)
      const pathMatch = url.pathname.match(/\/avatars\/(.+)$/)
      if (pathMatch) {
        await supabase.storage.from(BUCKET_NAME).remove([pathMatch[1]])
      }
    } catch (err) {
      // On ignore, pas grave
    }
    setPreview(null)
    onUploaded(null)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      <div
        onClick={() => !uploading && fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative group cursor-pointer transition-all ${uploading ? 'cursor-wait' : ''}`}
      >
        {/* Avatar ou preview */}
        <div
          className={`
            w-32 h-32 rounded-full flex items-center justify-center mx-auto
            transition-all border-2 border-dashed
            ${dragOver
              ? 'border-emerald-500 bg-emerald-50 scale-105'
              : preview
                ? 'border-transparent'
                : 'border-neutral-300 hover:border-emerald-400 bg-neutral-50'
            }
          `}
        >
          {preview ? (
            <img
              src={preview}
              alt="Avatar"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center text-4xl font-semibold">
              {initials}
            </div>
          )}

          {/* Overlay camera icon au hover */}
          {!uploading && (
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-white text-center">
                <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs font-medium">Changer</span>
              </div>
            </div>
          )}

          {/* Spinner pendant upload */}
          {uploading && (
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="text-sm text-emerald-600 font-medium hover:text-emerald-700 disabled:opacity-50"
        >
          {preview ? 'Changer la photo' : 'Ajouter une photo'}
        </button>
        {preview && !uploading && (
          <>
            <span className="text-neutral-300">·</span>
            <button
              type="button"
              onClick={handleRemove}
              className="text-sm text-red-600 font-medium hover:text-red-700"
            >
              Retirer
            </button>
          </>
        )}
      </div>

      <p className="mt-2 text-xs text-neutral-500 text-center">
        JPG, PNG ou WebP · max 5 MB · optionnel
      </p>

      {error && (
        <p className="mt-2 text-xs text-red-600 text-center">{error}</p>
      )}
    </div>
  )
}