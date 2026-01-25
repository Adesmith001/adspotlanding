import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MdArrowBack,
    MdArrowForward,
    MdCheck,
    MdCloudUpload,
    MdLocationOn,
    MdDelete,
} from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { useAppSelector } from '@/hooks/useRedux';
import { selectUser } from '@/store/authSlice';
import { createBillboard } from '@/services/billboard.service';
import type { BillboardType, CreateBillboardForm } from '@/types/billboard.types';
import toast from 'react-hot-toast';

const STEPS = [
    { id: 1, name: 'Basic Info', description: 'Title and description' },
    { id: 2, name: 'Location', description: 'Where is your billboard?' },
    { id: 3, name: 'Specifications', description: 'Size and type details' },
    { id: 4, name: 'Pricing', description: 'Set your rates' },
    { id: 5, name: 'Photos', description: 'Upload images' },
    { id: 6, name: 'Booking Rules', description: 'Availability settings' },
    { id: 7, name: 'Review', description: 'Confirm and submit' },
];

const CreateListing: React.FC = () => {
    const navigate = useNavigate();
    const user = useAppSelector(selectUser);
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [photos, setPhotos] = useState<File[]>([]);
    const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);

    // Form state
    const [formData, setFormData] = useState<CreateBillboardForm>({
        title: '',
        description: '',
        address: '',
        city: '',
        state: '',
        landmark: '',
        width: 0,
        height: 0,
        unit: 'ft',
        type: 'flex',
        hasLighting: false,
        trafficScore: 5,
        orientation: 'landscape',
        dailyPrice: 0,
        weeklyPrice: 0,
        monthlyPrice: 0,
        instantBook: false,
        minDuration: 1,
        maxDuration: 365,
        cancellationPolicy: 'moderate',
        advanceNotice: 1,
    });

    const updateFormData = (field: keyof CreateBillboardForm, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newPhotos = Array.from(files);
            setPhotos((prev) => [...prev, ...newPhotos]);

            // Create preview URLs
            newPhotos.forEach((file) => {
                const url = URL.createObjectURL(file);
                setPhotoPreviewUrls((prev) => [...prev, url]);
            });
        }
    };

    const removePhoto = (index: number) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
        setPhotoPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!user) {
            toast.error('You must be logged in to create a listing');
            return;
        }

        setIsSubmitting(true);
        try {
            await createBillboard(
                user.uid,
                user.displayName || 'Unknown',
                formData,
                photos
            );
            toast.success('Billboard listing created successfully!');
            navigate('/dashboard/owner/listings');
        } catch (error: any) {
            toast.error(error.message || 'Failed to create listing');
        } finally {
            setIsSubmitting(false);
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return formData.title.length >= 5 && formData.description.length >= 20;
            case 2:
                return formData.address && formData.city && formData.state;
            case 3:
                return formData.width > 0 && formData.height > 0;
            case 4:
                return formData.dailyPrice > 0;
            case 5:
                return photos.length >= 1;
            case 6:
                return true;
            case 7:
                return true;
            default:
                return true;
        }
    };

    const nigerianStates = [
        'Lagos', 'Abuja FCT', 'Rivers', 'Kano', 'Oyo', 'Kaduna', 'Edo', 'Enugu', 'Delta', 'Anambra'
    ];

    const nigerianCities: Record<string, string[]> = {
        'Lagos': ['Lagos Island', 'Victoria Island', 'Lekki', 'Ikeja', 'Surulere', 'Ikoyi', 'Yaba'],
        'Abuja FCT': ['Garki', 'Wuse', 'Maitama', 'Asokoro', 'Central Area'],
        'Rivers': ['Port Harcourt', 'Obio-Akpor'],
        'Kano': ['Kano Municipal', 'Nassarawa', 'Tarauni'],
        'Oyo': ['Ibadan North', 'Ibadan South', 'Oluyole'],
        'Kaduna': ['Kaduna North', 'Kaduna South', 'Zaria'],
        'Edo': ['Benin City', 'Ikpoba-Okha'],
        'Enugu': ['Enugu North', 'Enugu South', 'Enugu East'],
        'Delta': ['Warri', 'Asaba', 'Sapele'],
        'Anambra': ['Awka', 'Onitsha', 'Nnewi'],
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Billboard Title *
                            </label>
                            <Input
                                type="text"
                                placeholder="e.g., Premium LED Billboard - Lekki Phase 1"
                                value={formData.title}
                                onChange={(e) => updateFormData('title', e.target.value)}
                            />
                            <p className="text-xs text-neutral-500 mt-1">
                                Minimum 5 characters. Be descriptive and specific.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                rows={4}
                                placeholder="Describe your billboard location, visibility, nearby landmarks, traffic volume, and any special features..."
                                value={formData.description}
                                onChange={(e) => updateFormData('description', e.target.value)}
                            />
                            <p className="text-xs text-neutral-500 mt-1">
                                Minimum 20 characters. The more detail, the better.
                            </p>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                State *
                            </label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                value={formData.state}
                                onChange={(e) => {
                                    updateFormData('state', e.target.value);
                                    updateFormData('city', '');
                                }}
                            >
                                <option value="">Select State</option>
                                {nigerianStates.map((state) => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                City/Area *
                            </label>
                            <select
                                className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                value={formData.city}
                                onChange={(e) => updateFormData('city', e.target.value)}
                                disabled={!formData.state}
                            >
                                <option value="">Select City</option>
                                {formData.state && nigerianCities[formData.state]?.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Full Address *
                            </label>
                            <Input
                                type="text"
                                placeholder="e.g., 123 Admiralty Way, opposite Chevron"
                                value={formData.address}
                                onChange={(e) => updateFormData('address', e.target.value)}
                                icon={<MdLocationOn />}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Nearby Landmark (Optional)
                            </label>
                            <Input
                                type="text"
                                placeholder="e.g., Near Shoprite, Opposite GTBank"
                                value={formData.landmark || ''}
                                onChange={(e) => updateFormData('landmark', e.target.value)}
                            />
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Width *
                                </label>
                                <Input
                                    type="number"
                                    placeholder="e.g., 20"
                                    value={formData.width || ''}
                                    onChange={(e) => updateFormData('width', Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Height *
                                </label>
                                <Input
                                    type="number"
                                    placeholder="e.g., 10"
                                    value={formData.height || ''}
                                    onChange={(e) => updateFormData('height', Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Unit
                            </label>
                            <div className="flex gap-4">
                                {(['ft', 'm'] as const).map((unit) => (
                                    <label key={unit} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="unit"
                                            value={unit}
                                            checked={formData.unit === unit}
                                            onChange={() => updateFormData('unit', unit)}
                                            className="text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="text-neutral-700">{unit === 'ft' ? 'Feet' : 'Meters'}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Billboard Type *
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                {(['flex', 'digital', 'led'] as BillboardType[]).map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => updateFormData('type', type)}
                                        className={`p-4 rounded-xl border-2 transition-all ${formData.type === type
                                                ? 'border-primary-600 bg-primary-50'
                                                : 'border-neutral-200 hover:border-neutral-300'
                                            }`}
                                    >
                                        <span className="capitalize font-medium text-neutral-900">{type}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Orientation
                            </label>
                            <div className="flex gap-4">
                                {(['landscape', 'portrait'] as const).map((orientation) => (
                                    <label key={orientation} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="orientation"
                                            value={orientation}
                                            checked={formData.orientation === orientation}
                                            onChange={() => updateFormData('orientation', orientation)}
                                            className="text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="text-neutral-700 capitalize">{orientation}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="hasLighting"
                                checked={formData.hasLighting}
                                onChange={(e) => updateFormData('hasLighting', e.target.checked)}
                                className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
                            />
                            <label htmlFor="hasLighting" className="text-neutral-700">
                                Has lighting (visible at night)
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Traffic Score (1-10): {formData.trafficScore}
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={formData.trafficScore}
                                onChange={(e) => updateFormData('trafficScore', Number(e.target.value))}
                                className="w-full"
                            />
                            <p className="text-xs text-neutral-500 mt-1">
                                Estimate daily foot/vehicle traffic. 10 = Very High Traffic
                            </p>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Daily Rate (₦) *
                            </label>
                            <Input
                                type="number"
                                placeholder="e.g., 50000"
                                value={formData.dailyPrice || ''}
                                onChange={(e) => updateFormData('dailyPrice', Number(e.target.value))}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Weekly Rate (₦) - Optional discount
                            </label>
                            <Input
                                type="number"
                                placeholder="e.g., 300000"
                                value={formData.weeklyPrice || ''}
                                onChange={(e) => updateFormData('weeklyPrice', Number(e.target.value))}
                            />
                            <p className="text-xs text-neutral-500 mt-1">
                                Leave empty to auto-calculate as 7× daily rate
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Monthly Rate (₦) - Optional discount
                            </label>
                            <Input
                                type="number"
                                placeholder="e.g., 1000000"
                                value={formData.monthlyPrice || ''}
                                onChange={(e) => updateFormData('monthlyPrice', Number(e.target.value))}
                            />
                            <p className="text-xs text-neutral-500 mt-1">
                                Leave empty to auto-calculate as 30× daily rate
                            </p>
                        </div>

                        {formData.dailyPrice > 0 && (
                            <Card className="p-4 bg-neutral-50">
                                <p className="text-sm font-medium text-neutral-700 mb-2">Pricing Preview</p>
                                <div className="space-y-1 text-sm text-neutral-600">
                                    <p>Daily: ₦{formData.dailyPrice.toLocaleString()}</p>
                                    <p>Weekly: ₦{(formData.weeklyPrice || formData.dailyPrice * 7).toLocaleString()}</p>
                                    <p>Monthly: ₦{(formData.monthlyPrice || formData.dailyPrice * 30).toLocaleString()}</p>
                                </div>
                            </Card>
                        )}
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Upload Photos *
                            </label>
                            <p className="text-sm text-neutral-500 mb-4">
                                Add at least 1 photo. High-quality images attract more advertisers.
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                {photoPreviewUrls.map((url, index) => (
                                    <div key={index} className="relative group aspect-square rounded-xl overflow-hidden">
                                        <img
                                            src={url}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(index)}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <MdDelete size={16} />
                                        </button>
                                    </div>
                                ))}

                                <label className="aspect-square rounded-xl border-2 border-dashed border-neutral-300 hover:border-primary-500 flex flex-col items-center justify-center cursor-pointer transition-colors">
                                    <MdCloudUpload size={32} className="text-neutral-400 mb-2" />
                                    <span className="text-sm text-neutral-600">Upload</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                );

            case 6:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="instantBook"
                                checked={formData.instantBook}
                                onChange={(e) => updateFormData('instantBook', e.target.checked)}
                                className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
                            />
                            <div>
                                <label htmlFor="instantBook" className="font-medium text-neutral-900">
                                    Enable Instant Booking
                                </label>
                                <p className="text-sm text-neutral-500">
                                    Advertisers can book immediately without approval
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Minimum Booking Duration (days)
                                </label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={formData.minDuration}
                                    onChange={(e) => updateFormData('minDuration', Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Maximum Booking Duration (days)
                                </label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={formData.maxDuration}
                                    onChange={(e) => updateFormData('maxDuration', Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Advance Notice Required (days)
                            </label>
                            <Input
                                type="number"
                                min="0"
                                value={formData.advanceNotice}
                                onChange={(e) => updateFormData('advanceNotice', Number(e.target.value))}
                            />
                            <p className="text-xs text-neutral-500 mt-1">
                                How many days in advance must bookings be made?
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Cancellation Policy
                            </label>
                            <div className="space-y-3">
                                {[
                                    { value: 'flexible', label: 'Flexible', desc: 'Full refund up to 24 hours before' },
                                    { value: 'moderate', label: 'Moderate', desc: 'Full refund up to 5 days before' },
                                    { value: 'strict', label: 'Strict', desc: '50% refund up to 7 days before' },
                                ].map((policy) => (
                                    <label
                                        key={policy.value}
                                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.cancellationPolicy === policy.value
                                                ? 'border-primary-600 bg-primary-50'
                                                : 'border-neutral-200 hover:border-neutral-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="cancellationPolicy"
                                            value={policy.value}
                                            checked={formData.cancellationPolicy === policy.value}
                                            onChange={() => updateFormData('cancellationPolicy', policy.value)}
                                            className="text-primary-600 focus:ring-primary-500"
                                        />
                                        <div>
                                            <p className="font-medium text-neutral-900">{policy.label}</p>
                                            <p className="text-sm text-neutral-500">{policy.desc}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 7:
                return (
                    <div className="space-y-6">
                        <Card className="p-6">
                            <h3 className="text-lg font-bold text-neutral-900 mb-4">Review Your Listing</h3>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-neutral-500">Title</p>
                                    <p className="font-medium text-neutral-900">{formData.title}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-neutral-500">Location</p>
                                    <p className="font-medium text-neutral-900">
                                        {formData.address}, {formData.city}, {formData.state}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-neutral-500">Specifications</p>
                                    <p className="font-medium text-neutral-900">
                                        {formData.width}×{formData.height} {formData.unit} • {formData.type.toUpperCase()} •
                                        {formData.hasLighting ? ' With Lighting' : ' No Lighting'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-neutral-500">Pricing</p>
                                    <p className="font-medium text-neutral-900">
                                        ₦{formData.dailyPrice.toLocaleString()}/day
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-neutral-500">Photos</p>
                                    <p className="font-medium text-neutral-900">{photos.length} image(s) uploaded</p>
                                </div>

                                <div>
                                    <p className="text-sm text-neutral-500">Booking</p>
                                    <p className="font-medium text-neutral-900">
                                        {formData.instantBook ? 'Instant Book Enabled' : 'Requires Approval'}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <p className="text-sm text-neutral-500 text-center">
                            By submitting, you confirm that all information is accurate and you have the right to list this billboard.
                        </p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <DashboardLayout
            userRole="owner"
            title="Create New Listing"
            subtitle="Add a new billboard to your inventory"
        >
            <div className="max-w-3xl mx-auto">
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {STEPS.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${currentStep > step.id
                                            ? 'bg-green-500 text-white'
                                            : currentStep === step.id
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-neutral-200 text-neutral-500'
                                        }`}
                                >
                                    {currentStep > step.id ? <MdCheck size={16} /> : step.id}
                                </div>
                                {index < STEPS.length - 1 && (
                                    <div
                                        className={`hidden md:block w-12 lg:w-24 h-1 ${currentStep > step.id ? 'bg-green-500' : 'bg-neutral-200'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 text-center">
                        <p className="font-medium text-neutral-900">{STEPS[currentStep - 1].name}</p>
                        <p className="text-sm text-neutral-500">{STEPS[currentStep - 1].description}</p>
                    </div>
                </div>

                {/* Step Content */}
                <Card className="p-6 mb-8">
                    {renderStepContent()}
                </Card>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                        disabled={currentStep === 1}
                        icon={<MdArrowBack />}
                    >
                        Previous
                    </Button>

                    {currentStep < 7 ? (
                        <Button
                            onClick={() => setCurrentStep((prev) => Math.min(7, prev + 1))}
                            disabled={!canProceed()}
                            icon={<MdArrowForward />}
                        >
                            Next
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            loading={isSubmitting}
                            disabled={!canProceed() || isSubmitting}
                        >
                            Submit Listing
                        </Button>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CreateListing;
