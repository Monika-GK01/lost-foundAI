import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, X } from 'lucide-react';
import { lostItemsApi } from '@/lib/services';
import toast from 'react-hot-toast';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().optional(),
  color: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  dateLost: z.string().min(1, 'Date is required'),
  reward: z.string().optional(),
});

type FormInput = z.infer<typeof schema>;

export default function CreateLostItemPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormInput>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (formData: FormData) => lostItemsApi.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lost-items'] });
      toast.success('Lost item reported successfully!');
      navigate('/lost-items');
    },
    onError: () => toast.error('Failed to report lost item'),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setImages((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => setPreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: FormInput) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', data.category);
    if (data.brand) formData.append('brand', data.brand);
    if (data.color) formData.append('color', data.color);
    formData.append('location', data.location);
    formData.append('dateLost', data.dateLost);
    if (data.reward) formData.append('reward', data.reward);
    if (images.length > 0) {
  formData.append('image', images[0]);
}
    mutation.mutate(formData);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Report Lost Item</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium">Title *</label>
          <input {...register('title')} className="input-field" placeholder="e.g., Black iPhone 14 Pro" />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description *</label>
          <textarea {...register('description')} rows={4} className="input-field resize-none" placeholder="Describe the item in detail..." />
          {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Category *</label>
            <select {...register('category')} className="input-field">
              <option value="">Select category</option>
              <option value="ELECTRONICS">Electronics</option>
              <option value="CLOTHING">Clothing</option>
              <option value="BOOKS">Books</option>
              <option value="ACCESSORIES">Accessories</option>
              <option value="DOCUMENTS">Documents</option>
              <option value="OTHER">Other</option>
            </select>
            {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Brand</label>
            <input {...register('brand')} className="input-field" placeholder="e.g., Apple" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Color</label>
            <input {...register('color')} className="input-field" placeholder="e.g., Black" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Reward (optional)</label>
            <input {...register('reward')} className="input-field" placeholder="e.g., $20" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Location Lost *</label>
            <input {...register('location')} className="input-field" placeholder="e.g., Library, 2nd floor" />
            {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Date Lost *</label>
            <input {...register('dateLost')} type="date" className="input-field" />
            {errors.dateLost && <p className="mt-1 text-xs text-red-500">{errors.dateLost.message}</p>}
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="mb-1 block text-sm font-medium">Images</label>
          <div className="flex flex-wrap gap-3">
            {previews.map((src, i) => (
              <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-[var(--color-border)]">
                <img src={src} alt={`Preview ${i}`} className="h-full w-full object-cover" />
                <button type="button" onClick={() => removeImage(i)} className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white">
                  <X size={12} />
                </button>
              </div>
            ))}
            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--color-border)] text-[var(--color-text-secondary)] transition-colors hover:border-primary-400 hover:text-primary-600">
              <Upload size={20} />
              <span className="mt-1 text-[10px]">Upload</span>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">
            {mutation.isPending ? 'Submitting...' : 'Report Lost Item'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
