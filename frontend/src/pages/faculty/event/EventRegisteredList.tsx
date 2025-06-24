import React, { useEffect, useState } from 'react';
import { eventService } from '../../../services/eventService';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Rejected', value: 'Rejected' },
  { label: 'Pending', value: 'Pending' },
];

const EventRegisteredList: React.FC = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await eventService.getMyEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event: any) => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'Pending' && (!event.vcapproval_status || event.vcapproval_status === 'Pending')) ||
      event.vcapproval_status === statusFilter;
    const matchesSearch =
      event.event_name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-[#8B0000] border-b border-[#8B0000] pb-4">Registered Events</h1>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <div className="flex gap-2">
            {FILTERS.map(f => (
              <button
                key={f.value}
                className={`px-4 py-2 rounded-full border ${statusFilter === f.value ? 'bg-[#8B0000] text-white' : 'bg-gray-100 text-gray-700'} transition`}
                onClick={() => setStatusFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search by event name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-[#8B0000] focus:border-[#8B0000] flex-1"
          />
          <button
            onClick={fetchEvents}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto rounded-lg shadow">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700 sticky top-0">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Event Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">From Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">To Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Applied Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Approval Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map((event: any, index: number) => (
                  <tr key={event.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.event_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.fromdate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.todate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.event_budget || 'Not specified'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${event.vcapproval_status === 'Approved' ? 'bg-green-100 text-green-800' : 
                          event.vcapproval_status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {event.vcapproval_status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventRegisteredList;