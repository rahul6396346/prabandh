import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

const EventTypeSubtypeRegistration: React.FC = () => {
  const { toast } = useToast();
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [eventSubTypes, setEventSubTypes] = useState<EventSubType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeName, setEventTypeName] = useState('');
  const [eventSubTypeName, setEventSubTypeName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('/api/facultyservices/event-type-subtype-list/')
      .then(res => {
        setEventTypes(res.data.event_types);
        setEventSubTypes(res.data.event_subtypes);
      })
      .catch(() => toast({ title: 'Error', description: 'Failed to load event types and subtypes', variant: 'destructive' }));
  }, [toast]);

  const handleDeleteEventType = async (eventTypeId: number) => {
    try {
      await axios.delete(`/api/facultyservices/event-types/${eventTypeId}/delete/`);
      toast({ title: 'Success', description: 'Event type deleted successfully.' });
      const res = await axios.get('/api/facultyservices/event-type-subtype-list/');
      setEventTypes(res.data.event_types);
      setEventSubTypes(res.data.event_subtypes);
    } catch {
      toast({ title: 'Error', description: 'Failed to delete event type.', variant: 'destructive' });
    }
  };

  const handleDeleteEventSubType = async (eventSubTypeId: number) => {
    try {
      await axios.delete(`/api/facultyservices/event-subtypes/${eventSubTypeId}/delete/`);
      toast({ title: 'Success', description: 'Event subtype deleted successfully.' });
      const res = await axios.get('/api/facultyservices/event-type-subtype-list/');
      setEventTypes(res.data.event_types);
      setEventSubTypes(res.data.event_subtypes);
    } catch {
      toast({ title: 'Error', description: 'Failed to delete event subtype.', variant: 'destructive' });
    }
  };

  // Register new event type
  const handleTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTypeName.trim()) {
      toast({ title: 'Validation Error', description: 'Event type name required.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/facultyservices/event-type-subtype-list/', { event_type: eventTypeName });
      setEventTypeName('');
      toast({ title: 'Success', description: 'Event type registered.' });
      const res = await axios.get('/api/facultyservices/event-type-subtype-list/');
      setEventTypes(res.data.event_types);
      setEventSubTypes(res.data.event_subtypes);
    } catch {
      toast({ title: 'Error', description: 'Failed to register event type.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Register new event subtype
  const handleSubTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !eventSubTypeName.trim()) {
      toast({ title: 'Validation Error', description: 'Both event type and subtype name required.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/facultyservices/event-type-subtype-list/', { event_type_id: selectedType, event_subtype: eventSubTypeName });
      setEventSubTypeName('');
      toast({ title: 'Success', description: 'Event subtype registered.' });
      const res = await axios.get('/api/facultyservices/event-type-subtype-list/');
      setEventTypes(res.data.event_types);
      setEventSubTypes(res.data.event_subtypes);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error || 'Failed to register event subtype.';
      toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
          <CardTitle className="text-lg font-semibold text-[#8B0000]">Register Event Type</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleTypeSubmit} className="flex gap-4">
            <Input
              type="text"
              value={eventTypeName}
              onChange={e => setEventTypeName(e.target.value)}
              placeholder="Enter event type name"
              className="border-gray-200"
            />
            <Button type="submit" className="bg-[#8B0000] hover:bg-[#6d0000] text-white" disabled={loading}>
              {loading ? 'Registering...' : 'Register Type'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
          <CardTitle className="text-lg font-semibold text-[#8B0000]">Register Event Subtype</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubTypeSubmit} className="flex gap-4">
            <select
              className="border border-gray-300 rounded px-3 py-2 w-64"
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              required
            >
              <option value="">Select Event Type *</option>
              {eventTypes.map(type => (
                <option key={type.id} value={type.id}>{type.type}</option>
              ))}
            </select>
            <Input
              type="text"
              value={eventSubTypeName}
              onChange={e => setEventSubTypeName(e.target.value)}
              placeholder="Enter event subtype name"
              className="border-gray-200"
            />
            <Button type="submit" className="bg-[#8B0000] hover:bg-[#6d0000] text-white" disabled={loading}>
              {loading ? 'Registering...' : 'Register Subtype'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
          <CardTitle className="text-lg font-semibold text-[#8B0000]">Registered Event Types and Subtypes</CardTitle>
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
                <div key={type.id} className="flex items-center space-x-1">
                  <Button
                    variant={selectedType === type.id.toString() ? 'default' : 'outline'}
                    onClick={() => setSelectedType(type.id.toString())}
                  >
                    {type.type}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteEventType(type.id)}
                    style={{ padding: '0 8px' }}
                  >
                    Delete
                  </Button>
                </div>
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
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {eventSubTypes
                .filter(subtype => !selectedType || subtype.event_type.toString() === selectedType)
                .filter(subtype => subtype.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(subtype => {
                  const eventType = eventTypes.find(type => type.id === subtype.event_type);
                  return (
                    <tr key={subtype.id}>
                      <td className="border border-gray-300 px-4 py-2 flex items-center gap-2">
                        {eventType?.type}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{subtype.name}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteEventSubType(subtype.id)}
                        >
                          Delete Subtype
                        </Button>
                      </td>
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

export default EventTypeSubtypeRegistration;
 