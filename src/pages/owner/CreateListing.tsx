import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MdArrowBack,
    MdArrowForward,
    MdCheck,
    MdCloudUpload,
    MdLocationOn,
    MdDelete,
    MdCameraAlt,
    MdMyLocation,
} from 'react-icons/md';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon marker
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-expect-error - Icon scaling fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});
import DashboardLayout from '@/components/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { useAppSelector } from '@/hooks/useRedux';
import { selectUser } from '@/store/authSlice';
import { createBillboard } from '@/services/billboard.service';
import type { BillboardType, CreateBillboardForm } from '@/types/billboard.types';
import { extractGpsFromFiles } from '@/utils/exif.utils';
import toast from 'react-hot-toast';

const STEPS = [
    { id: 1, name: 'Basic Info', description: 'Title and description' },
    { id: 2, name: 'Photos & Location', description: 'Upload images to detect location' },
    { id: 3, name: 'Location Details', description: 'Address and map' },
    { id: 4, name: 'Specifications', description: 'Size and type details' },
    { id: 5, name: 'Pricing', description: 'Set your rates' },
    { id: 6, name: 'Booking Rules', description: 'Availability settings' },
    { id: 7, name: 'Review', description: 'Confirm and submit' },
];

const defaultCenter: [number, number] = [6.5244, 3.3792]; // Lagos

// Helper to handle map clicks
const MapEvents = ({ onClick }: { onClick: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// Helper to update map view when center changes
const MapViewUpdater = ({ center }: { center: [number, number] }) => {
    const map = useMapEvents({});
    React.useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

const CreateListing: React.FC = () => {
    const navigate = useNavigate();
    const user = useAppSelector(selectUser);
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [photos, setPhotos] = useState<File[]>([]);
    const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
    const [extractingLocation, setExtractingLocation] = useState(false);



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
        latitude: undefined,
        longitude: undefined,
    });

    const updateFormData = (field: keyof CreateBillboardForm, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const newPhotos = Array.from(files);
            setPhotos((prev) => [...prev, ...newPhotos]);
            newPhotos.forEach((file) => {
                const url = URL.createObjectURL(file);
                setPhotoPreviewUrls((prev) => [...prev, url]);
            });

            // Extract GPS from newly uploaded files
            if (!formData.latitude || !formData.longitude) {
                setExtractingLocation(true);
                try {
                    const gps = await extractGpsFromFiles(newPhotos);
                    if (gps) {
                        setFormData((prev) => ({
                            ...prev,
                            latitude: gps.latitude,
                            longitude: gps.longitude,
                        }));
                        toast.success('📍 Location detected from photo!', { duration: 4000 });
                    }
                } catch {
                    // silently fail if extraction errors
                } finally {
                    setExtractingLocation(false);
                }
            }
        }
    };

    const handleCameraCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newPhotos = Array.from(files);
            setPhotos((prev) => [...prev, ...newPhotos]);
            newPhotos.forEach((file) => {
                const url = URL.createObjectURL(file);
                setPhotoPreviewUrls((prev) => [...prev, url]);
            });

            // Always try to extract GPS from camera captures
            setExtractingLocation(true);
            try {
                const gps = await extractGpsFromFiles(newPhotos);
                if (gps) {
                    setFormData((prev) => ({
                        ...prev,
                        latitude: gps.latitude,
                        longitude: gps.longitude,
                    }));
                    toast.success('📍 Location detected from camera photo!', { duration: 4000 });
                } else {
                    toast('No GPS data found in this photo. Try taking the photo at the billboard location.', {
                        icon: 'ℹ️',
                        duration: 5000,
                    });
                }
            } catch {
                // silently fail
            } finally {
                setExtractingLocation(false);
            }
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
            await createBillboard(user.uid, user.displayName || 'Unknown', formData, photos);
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
            case 1: return formData.title.length >= 5 && formData.description.length >= 20;
            case 2: return photos.length >= 1;
            case 3: return formData.address && formData.city && formData.state;
            case 4: return formData.width > 0 && formData.height > 0;
            case 5: return formData.dailyPrice > 0;
            case 6: return true;
            case 7: return true;
            default: return true;
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

    const stepContentVariants = {
        initial: { opacity: 0, x: 30 },
        animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
        exit: { opacity: 0, x: -30, transition: { duration: 0.2 } },
    };

    const mapCenter: [number, number] = formData.latitude && formData.longitude
        ? [formData.latitude, formData.longitude]
        : defaultCenter;

    const mapZoom = formData.latitude && formData.longitude ? 16 : 11;

    const onMapClick = (lat: number, lng: number) => {
        setFormData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
        }));
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Billboard Title *</label>
                            <Input type="text" placeholder="e.g., Premium LED Billboard - Lekki Phase 1" value={formData.title} onChange={(e) => updateFormData('title', e.target.value)} />
                            <p className="text-xs text-neutral-500 mt-2">Minimum 5 characters. Be descriptive and specific.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Description *</label>
                            <textarea className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all duration-200" rows={4} placeholder="Describe your billboard location, visibility, nearby landmarks, traffic volume, and any special features..." value={formData.description} onChange={(e) => updateFormData('description', e.target.value)} />
                            <p className="text-xs text-neutral-500 mt-2">Minimum 20 characters. The more detail, the better.</p>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        {/* Instruction */}
                        <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-5 border border-primary-100">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <MdMyLocation size={22} className="text-primary-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-neutral-900 mb-1">Auto-detect billboard location</h4>
                                    <p className="text-sm text-neutral-600">
                                        Upload or take a photo at your billboard site. We'll automatically extract the GPS coordinates to pinpoint its exact location on the map.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Photo Upload Section */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Upload Photos *</label>
                            <p className="text-sm text-neutral-500 mb-4">Add at least 1 photo. Photos taken on-site will auto-detect location.</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <AnimatePresence>
                                    {photoPreviewUrls.map((url, index) => (
                                        <motion.div
                                            key={url}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ duration: 0.3 }}
                                            className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-neutral-200"
                                        >
                                            <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                            <motion.button
                                                whileTap={{ scale: 0.8 }}
                                                type="button"
                                                onClick={() => removePhoto(index)}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                            >
                                                <MdDelete size={16} />
                                            </motion.button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* Upload from gallery */}
                                <label className="aspect-square rounded-2xl border-2 border-dashed border-neutral-300 hover:border-primary-500 hover:bg-primary-50/30 flex flex-col items-center justify-center cursor-pointer transition-all duration-200">
                                    <MdCloudUpload size={32} className="text-neutral-400 mb-2" />
                                    <span className="text-sm text-neutral-600 font-medium">Upload</span>
                                    <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                                </label>

                                {/* Camera capture */}
                                <label className="aspect-square rounded-2xl border-2 border-dashed border-accent-300 hover:border-accent-500 hover:bg-accent-50/30 flex flex-col items-center justify-center cursor-pointer transition-all duration-200">
                                    <MdCameraAlt size={32} className="text-accent-400 mb-2" />
                                    <span className="text-sm text-accent-600 font-medium">Take Photo</span>
                                    <span className="text-xs text-accent-400 mt-0.5">Best for GPS</span>
                                    <input type="file" accept="image/*" capture="environment" onChange={handleCameraCapture} className="hidden" />
                                </label>
                            </div>
                        </div>

                        {/* GPS extraction status */}
                        <AnimatePresence>
                            {extractingLocation && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl border border-primary-100"
                                >
                                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-sm text-primary-700 font-medium">Extracting location from photo...</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Location detected indicator */}
                        <AnimatePresence>
                            {formData.latitude && formData.longitude && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                                <MdLocationOn size={22} className="text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-green-800">📍 Location Detected!</p>
                                                <p className="text-xs text-green-600 font-mono">
                                                    {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">State *</label>
                            <select className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all cursor-pointer" value={formData.state} onChange={(e) => { updateFormData('state', e.target.value); updateFormData('city', ''); }}>
                                <option value="">Select State</option>
                                {nigerianStates.map((state) => (<option key={state} value={state}>{state}</option>))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">City/Area *</label>
                            <select className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all cursor-pointer" value={formData.city} onChange={(e) => updateFormData('city', e.target.value)} disabled={!formData.state}>
                                <option value="">Select City</option>
                                {formData.state && nigerianCities[formData.state]?.map((city) => (<option key={city} value={city}>{city}</option>))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Full Address *</label>
                            <Input type="text" placeholder="e.g., 123 Admiralty Way, opposite Chevron" value={formData.address} onChange={(e) => updateFormData('address', e.target.value)} icon={<MdLocationOn />} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Nearby Landmark (Optional)</label>
                            <Input type="text" placeholder="e.g., Near Shoprite, Opposite GTBank" value={formData.landmark || ''} onChange={(e) => updateFormData('landmark', e.target.value)} />
                        </div>

                        {/* Interactive Map */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Billboard Location on Map
                            </label>
                            {formData.latitude && formData.longitude ? (
                                <p className="text-xs text-neutral-500 mb-3">
                                    Location auto-detected from your photo. Drag the pin or click on the map to adjust.
                                </p>
                            ) : (
                                <p className="text-xs text-neutral-500 mb-3">
                                    No GPS data extracted yet. Click anywhere on the map to set the location, or go back and upload a photo taken at the billboard site.
                                </p>
                            )}

                            <div className="rounded-2xl overflow-hidden border-2 border-neutral-200 shadow-soft relative z-0">
                                <MapContainer
                                    center={mapCenter}
                                    zoom={mapZoom}
                                    scrollWheelZoom={false}
                                    style={{ height: '350px', width: '100%' }}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <MapEvents onClick={onMapClick} />
                                    <MapViewUpdater center={mapCenter} />
                                    {formData.latitude && formData.longitude && (
                                        <Marker
                                            position={[formData.latitude, formData.longitude]}
                                            draggable={true}
                                            eventHandlers={{
                                                dragend: (e) => {
                                                    const marker = e.target;
                                                    const position = marker.getLatLng();
                                                    onMapClick(position.lat, position.lng);
                                                },
                                            }}
                                        />
                                    )}
                                </MapContainer>
                            </div>

                            {/* Coordinates display */}
                            {formData.latitude && formData.longitude && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-3 flex items-center gap-2"
                                >
                                    <MdLocationOn size={16} className="text-primary-500" />
                                    <span className="text-xs text-neutral-500 font-mono">
                                        Lat: {formData.latitude.toFixed(6)} • Lng: {formData.longitude.toFixed(6)}
                                    </span>
                                </motion.div>
                            )}
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Width *</label>
                                <Input type="number" placeholder="e.g., 20" value={formData.width || ''} onChange={(e) => updateFormData('width', Number(e.target.value))} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Height *</label>
                                <Input type="number" placeholder="e.g., 10" value={formData.height || ''} onChange={(e) => updateFormData('height', Number(e.target.value))} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Unit</label>
                            <div className="flex gap-4">
                                {(['ft', 'm'] as const).map((unit) => (
                                    <label key={unit} className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="unit" value={unit} checked={formData.unit === unit} onChange={() => updateFormData('unit', unit)} className="text-primary-600 focus:ring-primary-500" />
                                        <span className="text-neutral-700">{unit === 'ft' ? 'Feet' : 'Meters'}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Billboard Type *</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {(['flex', 'digital', 'led'] as BillboardType[]).map((type) => (
                                    <motion.button key={type} type="button" onClick={() => updateFormData('type', type)} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                                        className={`p-4 rounded-xl border-2 transition-all ${formData.type === type ? 'border-primary-600 bg-primary-50 shadow-soft' : 'border-neutral-200 hover:border-neutral-300'}`}>
                                        <span className="capitalize font-medium text-neutral-900">{type}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Orientation</label>
                            <div className="flex gap-4">
                                {(['landscape', 'portrait'] as const).map((orientation) => (
                                    <label key={orientation} className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="orientation" value={orientation} checked={formData.orientation === orientation} onChange={() => updateFormData('orientation', orientation)} className="text-primary-600 focus:ring-primary-500" />
                                        <span className="text-neutral-700 capitalize">{orientation}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <input type="checkbox" id="hasLighting" checked={formData.hasLighting} onChange={(e) => updateFormData('hasLighting', e.target.checked)} className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500" />
                            <label htmlFor="hasLighting" className="text-neutral-700">Has lighting (visible at night)</label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Traffic Score (1-10): <span className="text-primary-600 font-bold">{formData.trafficScore}</span>
                            </label>
                            <input type="range" min="1" max="10" value={formData.trafficScore} onChange={(e) => updateFormData('trafficScore', Number(e.target.value))} className="w-full" />
                            <p className="text-xs text-neutral-500 mt-2">Estimate daily foot/vehicle traffic. 10 = Very High Traffic</p>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Daily Rate (₦) *</label>
                            <Input type="number" placeholder="e.g., 50000" value={formData.dailyPrice || ''} onChange={(e) => updateFormData('dailyPrice', Number(e.target.value))} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Weekly Rate (₦) - Optional discount</label>
                            <Input type="number" placeholder="e.g., 300000" value={formData.weeklyPrice || ''} onChange={(e) => updateFormData('weeklyPrice', Number(e.target.value))} />
                            <p className="text-xs text-neutral-500 mt-2">Leave empty to auto-calculate as 7× daily rate</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Monthly Rate (₦) - Optional discount</label>
                            <Input type="number" placeholder="e.g., 1000000" value={formData.monthlyPrice || ''} onChange={(e) => updateFormData('monthlyPrice', Number(e.target.value))} />
                            <p className="text-xs text-neutral-500 mt-2">Leave empty to auto-calculate as 30× daily rate</p>
                        </div>
                        {formData.dailyPrice > 0 && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <Card className="p-5 bg-gradient-to-r from-neutral-50 to-primary-50/30">
                                    <p className="text-sm font-semibold text-neutral-700 mb-3">Pricing Preview</p>
                                    <div className="space-y-1.5 text-sm text-neutral-600">
                                        <p>Daily: <span className="font-bold text-neutral-900">₦{formData.dailyPrice.toLocaleString()}</span></p>
                                        <p>Weekly: <span className="font-bold text-neutral-900">₦{(formData.weeklyPrice || formData.dailyPrice * 7).toLocaleString()}</span></p>
                                        <p>Monthly: <span className="font-bold text-neutral-900">₦{(formData.monthlyPrice || formData.dailyPrice * 30).toLocaleString()}</span></p>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </div>
                );
            case 6:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <input type="checkbox" id="instantBook" checked={formData.instantBook} onChange={(e) => updateFormData('instantBook', e.target.checked)} className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500" />
                            <div>
                                <label htmlFor="instantBook" className="font-medium text-neutral-900">Enable Instant Booking</label>
                                <p className="text-sm text-neutral-500">Advertisers can book immediately without approval</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Minimum Duration (days)</label>
                                <Input type="number" min="1" value={formData.minDuration} onChange={(e) => updateFormData('minDuration', Number(e.target.value))} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">Maximum Duration (days)</label>
                                <Input type="number" min="1" value={formData.maxDuration} onChange={(e) => updateFormData('maxDuration', Number(e.target.value))} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Advance Notice (days)</label>
                            <Input type="number" min="0" value={formData.advanceNotice} onChange={(e) => updateFormData('advanceNotice', Number(e.target.value))} />
                            <p className="text-xs text-neutral-500 mt-2">How many days in advance must bookings be made?</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-3">Cancellation Policy</label>
                            <div className="space-y-3">
                                {[
                                    { value: 'flexible', label: 'Flexible', desc: 'Full refund up to 24 hours before' },
                                    { value: 'moderate', label: 'Moderate', desc: 'Full refund up to 5 days before' },
                                    { value: 'strict', label: 'Strict', desc: '50% refund up to 7 days before' },
                                ].map((policy) => (
                                    <motion.label key={policy.value} whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }}
                                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.cancellationPolicy === policy.value ? 'border-primary-600 bg-primary-50 shadow-soft' : 'border-neutral-200 hover:border-neutral-300'}`}>
                                        <input type="radio" name="cancellationPolicy" value={policy.value} checked={formData.cancellationPolicy === policy.value} onChange={() => updateFormData('cancellationPolicy', policy.value)} className="text-primary-600 focus:ring-primary-500" />
                                        <div>
                                            <p className="font-medium text-neutral-900">{policy.label}</p>
                                            <p className="text-sm text-neutral-500">{policy.desc}</p>
                                        </div>
                                    </motion.label>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 7:
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
                        <Card className="p-6 md:p-8 border-primary-100 bg-gradient-to-r from-white to-primary-50/20">
                            <h3 className="text-lg font-bold text-neutral-900 mb-6">Review Your Listing</h3>
                            <div className="space-y-5">
                                {[
                                    { label: 'Title', value: formData.title },
                                    { label: 'Location', value: `${formData.address}, ${formData.city}, ${formData.state}` },
                                    { label: 'GPS', value: formData.latitude && formData.longitude ? `${formData.latitude.toFixed(6)}, ${formData.longitude.toFixed(6)}` : 'Not set' },
                                    { label: 'Specifications', value: `${formData.width}×${formData.height} ${formData.unit} • ${formData.type.toUpperCase()} • ${formData.hasLighting ? 'With Lighting' : 'No Lighting'}` },
                                    { label: 'Pricing', value: `₦${formData.dailyPrice.toLocaleString()}/day` },
                                    { label: 'Photos', value: `${photos.length} image(s) uploaded` },
                                    { label: 'Booking', value: formData.instantBook ? 'Instant Book Enabled' : 'Requires Approval' },
                                ].map((item, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                                        className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2 border-b border-neutral-100 last:border-0">
                                        <p className="text-sm text-neutral-500 sm:w-32 flex-shrink-0">{item.label}</p>
                                        <p className="font-medium text-neutral-900">{item.value}</p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Mini map preview in review */}
                            {formData.latitude && formData.longitude && (
                                <div className="mt-6">
                                    <p className="text-sm text-neutral-500 mb-2">Map Preview</p>
                                    <div className="rounded-xl overflow-hidden border border-neutral-200 z-0">
                                        <MapContainer
                                            center={[formData.latitude, formData.longitude]}
                                            zoom={15}
                                            scrollWheelZoom={false}
                                            dragging={false}
                                            zoomControl={false}
                                            touchZoom={false}
                                            doubleClickZoom={false}
                                            style={{ height: '200px', width: '100%' }}
                                        >
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <Marker position={[formData.latitude, formData.longitude]} />
                                        </MapContainer>
                                    </div>
                                </div>
                            )}
                        </Card>
                        <p className="text-sm text-neutral-500 text-center">
                            By submitting, you confirm that all information is accurate and you have the right to list this billboard.
                        </p>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };

    return (
        <DashboardLayout userRole="owner" title="Create New Listing" subtitle="Add a new billboard to your inventory">
            <div className="max-w-4xl mx-auto">
                {/* Progress Steps */}
                <div className="mb-10">
                    <div className="overflow-x-auto pb-2">
                        <div className="flex items-center justify-between min-w-[760px]">
                            {STEPS.map((step, index) => (
                                <div key={step.id} className="flex items-center">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: currentStep === step.id ? 1.1 : 1,
                                        backgroundColor: currentStep > step.id ? '#22c55e' : currentStep === step.id ? '#6366f1' : '#e5e7eb',
                                    }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium"
                                    style={{ color: currentStep >= step.id ? '#fff' : '#737373' }}
                                >
                                    {currentStep > step.id ? <MdCheck size={18} /> : step.id}
                                </motion.div>
                                    {index < STEPS.length - 1 && (
                                        <div className="hidden md:block w-12 lg:w-24 h-1 bg-neutral-200 relative overflow-hidden rounded-full">
                                            <motion.div
                                                initial={{ width: '0%' }}
                                                animate={{ width: currentStep > step.id ? '100%' : '0%' }}
                                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                                className="absolute inset-y-0 left-0 bg-green-500 rounded-full"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 text-center"
                    >
                        <p className="font-semibold text-neutral-900">{STEPS[currentStep - 1].name}</p>
                        <p className="text-sm text-neutral-500">{STEPS[currentStep - 1].description}</p>
                    </motion.div>
                </div>

                {/* Step Content */}
                <Card className="p-6 md:p-8 mb-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            variants={stepContentVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                        >
                            {renderStepContent()}
                        </motion.div>
                    </AnimatePresence>
                </Card>

                {/* Navigation */}
                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            variant="outline"
                            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                            disabled={currentStep === 1}
                            icon={<MdArrowBack />}
                            className="w-full sm:w-auto"
                        >
                            Previous
                        </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        {currentStep < 7 ? (
                            <Button onClick={() => setCurrentStep((prev) => Math.min(7, prev + 1))} disabled={!canProceed()} icon={<MdArrowForward />} className="w-full sm:w-auto">
                                Next
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} loading={isSubmitting} disabled={!canProceed() || isSubmitting} className="w-full sm:w-auto">
                                Submit Listing
                            </Button>
                        )}
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CreateListing;
