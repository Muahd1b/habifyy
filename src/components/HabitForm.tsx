import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { Habit } from '@/pages/Index';

interface HabitFormProps {
  onSubmit: (habit: {
    name: string;
    description?: string;
    color: string;
    target: number;
    category?: string;
  }) => void;
  onCancel: () => void;
}

const colorOptions = [
  { name: 'Blue Ocean', value: 'from-blue-500 to-cyan-500' },
  { name: 'Purple Dream', value: 'from-purple-500 to-pink-500' },
  { name: 'Green Forest', value: 'from-green-500 to-emerald-500' },
  { name: 'Orange Sunset', value: 'from-orange-500 to-red-500' },
  { name: 'Pink Blossom', value: 'from-pink-500 to-rose-500' },
  { name: 'Teal Wave', value: 'from-teal-500 to-blue-500' },
  { name: 'Indigo Night', value: 'from-indigo-500 to-purple-500' },
  { name: 'Amber Glow', value: 'from-amber-500 to-orange-500' }
];

export const HabitForm = ({ onSubmit, onCancel }: HabitFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: colorOptions[0].value,
    target: 1
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Habit name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Habit name must be at least 2 characters';
    }

    if (formData.target < 1) {
      newErrors.target = 'Target must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="w-full max-w-md p-6 space-y-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Create New Habit</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Habit Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Habit Name *
            </label>
            <Input
              id="name"
              placeholder="e.g., Morning Meditation"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="What's this habit about?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          {/* Daily Target */}
          <div className="space-y-2">
            <label htmlFor="target" className="text-sm font-medium">
              Daily Target *
            </label>
            <Input
              id="target"
              type="number"
              min="1"
              placeholder="1"
              value={formData.target}
              onChange={(e) => setFormData({ ...formData, target: parseInt(e.target.value) || 1 })}
              className={errors.target ? 'border-destructive' : ''}
            />
            {errors.target && (
              <p className="text-sm text-destructive">{errors.target}</p>
            )}
            <p className="text-xs text-muted-foreground">
              How many times per day do you want to do this habit?
            </p>
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Choose Color Theme</label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`
                    h-10 rounded-lg border-2 transition-all
                    bg-gradient-to-br ${option.value}
                    ${formData.color === option.value 
                      ? 'border-primary shadow-medium scale-110' 
                      : 'border-border hover:border-primary/50 hover:scale-105'
                    }
                  `}
                  onClick={() => setFormData({ ...formData, color: option.value })}
                  title={option.name}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-primary text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Habit
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};