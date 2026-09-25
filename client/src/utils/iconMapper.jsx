import React from 'react';
import {
  Wheat,
  Briefcase,
  Home,
  HeartPulse,
  Sprout,
  Car,
  HeartHandshake,
  User,
  Users,
  MapPin,
  Maximize2,
  Calendar,
  Clock,
  Phone,
  CreditCard,
  Navigation,
  CheckCircle2,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  HelpCircle,
  FileText,
  AlertCircle
} from 'lucide-react';

const ICON_MAP = {
  Wheat,
  Briefcase,
  Home,
  HeartPulse,
  Sprout,
  Car,
  HeartHandshake,
  User,
  Users,
  MapPin,
  Maximize2,
  Calendar,
  Clock,
  Phone,
  CreditCard,
  Navigation,
  CheckCircle2,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  HelpCircle,
  FileText,
  AlertCircle
};

export function getPictogram(iconName, className = "w-8 h-8") {
  const IconComponent = ICON_MAP[iconName] || FileText;
  return <IconComponent className={className} />;
}
