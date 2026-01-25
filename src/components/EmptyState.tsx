import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
    className?: string;
}

/**
 * EmptyState Component
 * 
 * A reusable component for displaying empty states across the application.
 * Following Steve Jobs' design philosophy: simple, focused, and helpful.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
    className = '',
}) => {
    return (
        <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
            {/* Icon */}
            <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-6">
                <div className="text-neutral-400 text-4xl">
                    {icon}
                </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-neutral-900 mb-2 text-center">
                {title}
            </h3>

            {/* Description */}
            <p className="text-neutral-600 text-center max-w-md mb-6 leading-relaxed">
                {description}
            </p>

            {/* Action Button */}
            {actionLabel && (actionHref || onAction) && (
                actionHref ? (
                    <Link to={actionHref}>
                        <Button size="lg">{actionLabel}</Button>
                    </Link>
                ) : (
                    <Button size="lg" onClick={onAction}>{actionLabel}</Button>
                )
            )}
        </div>
    );
};

export default EmptyState;
