import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import axios from '@/lib/axios';

interface EventType {
  id: number;
  type: string;
}

interface EventSubType {
  id: number;
  name: string;
  event_type: number;
}

const EventRegistration: React.FC = () => {
  const { toast } = useToast();
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [eventSubTypes, setEventSubTypes] = useState<EventSubType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedSubType, setSelectedSubType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSubTypes, setFilteredSubTypes] = useState<EventSubType[]>([]);

  useEffect(() => {
    // Fetch event types
    axios.get('/api/facultyservices/event-types/')
      .then(res => setEventTypes(res.data))
      .catch(() => toast({ title: 'Error', description: 'Failed to load event types', variant: 'destructive' }));
  }, [toast]);

  useEffect(() => {
    if (selectedType) {
      axios.get(`/api/facultyservices/event-subtypes/?event_type=${selectedType}`)
        .then(res => {
          setEventSubTypes(res.data);
          setFilteredSubTypes(res.data);
        })
        .catch(() => toast({ title: 'Error', description: 'Failed to load event subtypes', variant: 'destructive' }));
    } else {
      setEventSubTypes([]);
      setFilteredSubTypes([]);
      setSelectedSubType('');
    }
  }, [selectedType, toast]);

  useEffect(() => {
    const filtered = eventSubTypes.filter(subtype =>
      subtype.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSubTypes(filtered);
  }, [searchQuery, eventSubTypes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !selectedSubType) {
      toast({ title: 'Validation Error', description: 'Please select both event type and subtype.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Success', description: 'Event registered (demo only)', variant: 'default' });
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="border-0 shadow-md max-w-xl mx-auto">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-[#8B0000]">
            Event Registration
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <Select value={selectedType} onValueChange={setSelectedType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select Event Type *" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map(type => (
                  <SelectItem key={type.id} value={type.id.toString()}>{type.type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSubType} onValueChange={setSelectedSubType} required disabled={!selectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Select Event Subtype *" />
              </SelectTrigger>
              <SelectContent>
                {filteredSubTypes.map(sub => (
                  <SelectItem key={sub.id} value={sub.id.toString()}>{sub.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="w-full bg-[#8B0000] hover:bg-[#6d0000] text-white" disabled={loading}>
              {loading ? 'Registering...' : 'Register Event'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-md max-w-xl mx-auto">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-[#8B0000]">
            Registered Event Types and Subtypes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <Button
                variant={selectedType === '' ? 'default' : 'outline'}
                onClick={() => setSelectedType('')}
              >
                All Types
              </Button>
              {eventTypes.map(type => (
                <Button
                  key={type.id}
                  variant={selectedType === type.id.toString() ? 'default' : 'outline'}
                  onClick={() => setSelectedType(type.id.toString())}
                >
                  {type.type}
                </Button>
              ))}
            </div>
            <Input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search subtypes..."
              className="border-gray-200 w-1/3"
            />
          </div>
          <table className="table-auto w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Event Type</th>
                <th className="border border-gray-300 px-4 py-2">Event Subtype</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubTypes.map(subtype => {
                const eventType = eventTypes.find(type => type.id === subtype.event_type);
                return (
                  <tr key={subtype.id}>
                    <td className="border border-gray-300 px-4 py-2">{eventType?.type}</td>
                    <td className="border border-gray-300 px-4 py-2">{subtype.name}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventRegistration;
