import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Quote, Plus } from 'lucide-react';

interface CreateQuoteModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (quote: { text: string; author?: string; category?: string }) => void;
}

export const CreateQuoteModal = ({ open, onClose, onSubmit }: CreateQuoteModalProps) => {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('personal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    onSubmit({
      text: text.trim(),
      author: author.trim() || undefined,
      category
    });

    setText('');
    setAuthor('');
    setCategory('personal');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Quote className="w-5 h-5 text-primary" />
            Create Personal Quote
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quote-text">Quote Text</Label>
            <Textarea
              id="quote-text"
              placeholder="Enter your inspiring quote..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[100px] resize-none"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quote-author">Author (Optional)</Label>
            <Input
              id="quote-author"
              placeholder="Who said this? (defaults to 'You')"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quote-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="motivation">Motivation</SelectItem>
                <SelectItem value="mindset">Mindset</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="habits">Habits</SelectItem>
                <SelectItem value="inspiration">Inspiration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Quote
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};