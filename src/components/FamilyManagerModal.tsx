import React, { useState } from 'react';
import { FamilyMember } from '../types';
import { X, Plus, Users, Heart, Phone, Trash2, CheckCircle2 } from 'lucide-react';

interface FamilyManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyMembers: FamilyMember[];
  onAddMember: (member: FamilyMember) => void;
  onRemoveMember: (id: string) => void;
}

export const FamilyManagerModal: React.FC<FamilyManagerModalProps> = ({
  isOpen,
  onClose,
  familyMembers,
  onAddMember,
  onRemoveMember
}) => {
  const [name, setName] = useState('');
  const [relation, setRelation] = useState<'Parent' | 'Grandparent' | 'Spouse' | 'Child' | 'Other'>('Parent');
  const [phone, setPhone] = useState('');
  const [isEmergency, setIsEmergency] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const newMember: FamilyMember = {
      id: `fam-${Date.now()}`,
      name: name.trim(),
      relation,
      phone: phone.trim(),
      emergencyContact: isEmergency,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80'
    };

    onAddMember(newMember);
    setName('');
    setPhone('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fade-in">
      
      <div 
        className="w-full max-w-[500px] bg-white rounded-3xl border border-navy-200 shadow-modal overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-navy-100 flex items-center justify-between bg-[#FAFBFD]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-rose-500" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Safety First</span>
              <h3 className="text-lg font-extrabold text-navy-950">Family Safety Hub</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-navy-100 hover:bg-navy-200 text-navy-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div className="p-3 bg-rose-50/70 border border-rose-200/60 rounded-2xl text-xs text-navy-800 leading-relaxed">
            Registered family members automatically receive driver name, live vehicle GPS coordinates, and SMS ETA updates whenever you book a drive for them.
          </div>

          {/* Members List */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-navy-500">
              Your Loved Ones ({familyMembers.length})
            </div>

            {familyMembers.map((member) => (
              <div
                key={member.id}
                className="p-3 bg-[#FAFBFD] rounded-2xl border border-navy-200/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover border border-white shadow-xs"
                  />
                  <div>
                    <div className="text-xs font-bold text-navy-950 flex items-center gap-1.5">
                      <span>{member.name}</span>
                      <span className="text-[10px] font-semibold text-navy-500">
                        ({member.relation})
                      </span>
                    </div>
                    <div className="text-[11px] text-navy-500 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-navy-400" />
                      <span>{member.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {member.emergencyContact && (
                    <span className="text-[9px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      SOS Linked
                    </span>
                  )}
                  <button
                    onClick={() => onRemoveMember(member.id)}
                    className="p-1.5 text-navy-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Member Toggle / Form */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-navy-200 hover:border-bee-500 text-xs font-bold text-navy-700 hover:text-bee-700 flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Family Member</span>
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="p-4 bg-navy-50 rounded-2xl border border-navy-200 space-y-3 animate-fade-in">
              <div className="text-xs font-bold text-navy-950">Add Family Member Details</div>

              <div>
                <label className="block text-[11px] font-semibold text-navy-600 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Sayed"
                  className="w-full px-3 py-2 text-xs bg-white border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bee-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-navy-600 mb-1">Relationship</label>
                  <select
                    value={relation}
                    onChange={(e) => setRelation(e.target.value as any)}
                    className="w-full px-2.5 py-2 text-xs bg-white border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bee-500/40 font-medium"
                  >
                    <option value="Parent">Parent</option>
                    <option value="Grandparent">Grandparent</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-navy-600 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98450 XXXXX"
                    className="w-full px-3 py-2 text-xs bg-white border border-navy-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bee-500/40"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="sos-check"
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                  className="rounded text-bee-600 focus:ring-bee-500"
                />
                <label htmlFor="sos-check" className="text-xs text-navy-700 font-medium">
                  Set as Emergency SOS Contact
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-xl bg-bee-600 hover:bg-bee-700 text-white text-xs font-bold transition-colors"
                >
                  Save Member
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="py-2 px-3 rounded-xl bg-navy-200 text-navy-800 text-xs font-semibold hover:bg-navy-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

        </div>

      </div>

    </div>
  );
};
