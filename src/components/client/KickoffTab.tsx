import { useState, useMemo } from 'react';
import { Clock, Video, CheckCircle2, CalendarIcon, Loader2, ArrowRight, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays, isBefore, startOfDay, getDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCalendarSlots } from '@/hooks/useCalendarSlots';

type Step = 'info' | 'calendar' | 'confirmed';

export default function KickoffTab() {
  const [step, setStep] = useState<Step>('info');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [guests, setGuests] = useState<string[]>([]);
  const [guestInput, setGuestInput] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const today = useMemo(() => startOfDay(new Date()), []);
  const { calendarId, slots, loadingSlots } = useCalendarSlots({ route: '/kickoff', selectedDate });

  const isInfoValid = name.trim().length > 0 && email.trim().length > 0;

  const addGuest = () => {
    const trimmed = guestInput.trim();
    if (trimmed && trimmed.includes('@') && !guests.includes(trimmed)) {
      setGuests([...guests, trimmed]);
      setGuestInput('');
    }
  };

  const removeGuest = (g: string) => setGuests(guests.filter((e) => e !== g));

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isInfoValid) return;
    setStep('calendar');
  };

  const disabledDays = (date: Date) => {
    const day = getDay(date);
    return isBefore(date, today) || day === 0 || day === 6;
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime || loading) return;
    setLoading(true);
    try {
      const [timePart, ampm] = selectedTime.split(' ');
      const [h, m] = timePart.split(':').map(Number);
      const hour24 = ampm === 'PM' && h !== 12 ? h + 12 : ampm === 'AM' && h === 12 ? 0 : h;
      const startTime = new Date(selectedDate);
      startTime.setHours(hour24, m, 0, 0);

      await supabase.functions.invoke('ghl-sync', {
        body: {
          action: 'sync-booking',
          name,
          email,
          phone: phone || undefined,
          calendarId: calendarId || 'F1ZShaGIFnOCnk7AahCa',
          startTime: startTime.toISOString(),
          title: `30-min Kickoff Call - ${name}`,
          guests,
        },
      });
      toast.success('Kickoff call booked!');
      setStep('confirmed');
    } catch (err) {
      console.error('Booking error:', err);
      toast.error('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
          <CheckCircle2 className="w-3.5 h-3.5" /> You're almost there
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
          Congratulations!
        </h2>
        <p className="text-lg text-muted-foreground max-w-lg mx-auto">
          Let's schedule your <span className="text-foreground font-semibold">Kickoff Call</span> to get started.
        </p>
        <div className="luxury-divider mt-6" />
      </section>

      {/* Main booking card */}
      <section className="max-w-4xl mx-auto">
        <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
          {/* Step indicator */}
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-1 max-w-md mx-auto">
              {(['info', 'calendar', 'confirmed'] as const).map((s, i) => {
                const labels = ['Your Info', 'Pick a Time', 'Confirmed'];
                const currentIdx = ['info', 'calendar', 'confirmed'].indexOf(step);
                const isDone = i < currentIdx;
                const isActive = s === step;
                return (
                  <div key={s} className="flex items-center gap-1 flex-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${isDone ? 'bg-primary text-primary-foreground' : isActive ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : 'bg-muted text-muted-foreground'}`}>
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                      </div>
                      <span className={`text-xs font-medium truncate ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{labels[i]}</span>
                    </div>
                    {i < 2 && <div className={`flex-1 h-px mx-2 ${isDone ? 'bg-primary' : 'bg-border'}`} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step: Info */}
          {step === 'info' && (
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-72 shrink-0 p-6 lg:p-8 lg:border-r border-border">
                <CallSidebar />
              </div>
              <div className="flex-1 p-6 lg:p-8">
                <form onSubmit={handleInfoSubmit} className="space-y-5">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Enter your details</h3>
                    <p className="text-sm text-muted-foreground mt-1">We'll use this to set up your kickoff call.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Full Name <span className="text-destructive">*</span></label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith" required className="h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Email <span className="text-destructive">*</span></label>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required className="h-11" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Phone Number</label>
                    <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" className="h-11" />
                  </div>

                  {/* Guest emails */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-primary" /> Add Guests
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        value={guestInput}
                        onChange={(e) => setGuestInput(e.target.value)}
                        placeholder="guest@example.com"
                        className="h-10"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') { e.preventDefault(); addGuest(); }
                        }}
                      />
                      <Button type="button" variant="outline" size="sm" onClick={addGuest} className="h-10 px-4 shrink-0">Add</Button>
                    </div>
                    {guests.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {guests.map((g) => (
                          <span key={g} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full">
                            {g}
                            <button type="button" onClick={() => removeGuest(g)} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button type="submit" size="lg" className="w-full h-12 font-semibold text-base gap-2" disabled={!isInfoValid}>
                    Continue to Schedule <ArrowRight className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* Step: Calendar */}
          {step === 'calendar' && (
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-72 shrink-0 p-6 lg:p-8 lg:border-r border-border">
                <CallSidebar selectedDate={selectedDate} selectedTime={selectedTime} />
                <div className="mt-6 pt-5 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span>Booking for <span className="text-foreground font-medium">{name}</span></span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{email}</p>
                  {guests.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">{guests.length} guest{guests.length > 1 ? 's' : ''} invited</p>
                  )}
                  <button onClick={() => setStep('info')} className="text-xs text-primary hover:underline mt-2 font-medium">Edit details</button>
                </div>
              </div>
              <div className="flex-1 p-6 lg:p-8">
                <h3 className="text-xl font-bold text-foreground mb-1">Select a date & time</h3>
                <p className="text-sm text-muted-foreground mb-6">Choose an available slot that works for you.</p>
                <div className="flex flex-col lg:flex-row gap-6">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => { setSelectedDate(d); setSelectedTime(null); }}
                    disabled={disabledDays}
                    fromDate={today}
                    toDate={addDays(today, 60)}
                    className="rounded-xl border border-border"
                  />
                  {selectedDate && (
                    <div className="space-y-2 min-w-[150px]">
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">{format(selectedDate, 'EEE, MMM d')}</p>
                      {loadingSlots ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground py-4"><Loader2 className="w-4 h-4 animate-spin" /><span>Loading availability…</span></div>
                      ) : slots.length > 0 ? (
                        slots.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`w-full px-4 py-3 rounded-lg border text-sm font-medium transition-all ${selectedTime === time ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'border-border text-foreground hover:border-primary/50 hover:bg-primary/5'}`}
                          >
                            {time}
                          </button>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground py-4">No available slots for this date.</p>
                      )}
                    </div>
                  )}
                </div>
                {selectedDate && selectedTime && (
                  <div className="mt-8">
                    <Button size="lg" className="w-full sm:w-auto h-12 font-semibold text-base gap-2 px-10" onClick={handleConfirm} disabled={loading}>
                      {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Booking...</>) : (<>Confirm Kickoff Call <ArrowRight className="w-4 h-4" /></>)}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step: Confirmed */}
          {step === 'confirmed' && (
            <div className="p-8 md:p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">You're booked!</h3>
              <p className="text-muted-foreground mb-1">A confirmation email has been sent to <span className="text-foreground font-medium">{email}</span>.</p>
              {selectedDate && selectedTime && (
                <p className="text-primary font-semibold">{format(selectedDate, 'EEEE, MMMM d, yyyy')} at {selectedTime}</p>
              )}
              {guests.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">Calendar invite sent to {guests.length} guest{guests.length > 1 ? 's' : ''}.</p>
              )}
              <p className="text-sm text-muted-foreground mt-4">You'll receive a Zoom link before your call.</p>
            </div>
          )}
        </div>
      </section>

      {/* Tips */}
      <section className="max-w-2xl mx-auto">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Before Your Call</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Complete Ad Access', desc: 'Make sure you\'ve granted Facebook, Google, and LinkedIn access from the Access tab.' },
            { title: 'Prepare Your Assets', desc: 'Have your logo, brand guidelines, and any existing ad creatives ready.' },
            { title: 'Know Your Numbers', desc: 'Have your funding goal, timeline, and average investment size in mind.' },
            { title: 'Review Resources', desc: 'Check out the sales scripts and flow diagrams in the Resources tab.' },
          ].map((tip) => (
            <div key={tip.title} className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-all">
              <h4 className="font-display text-sm font-semibold text-foreground mb-1">{tip.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function CallSidebar({ selectedDate, selectedTime }: { selectedDate?: Date; selectedTime?: string | null }) {
  return (
    <div className="space-y-5">
      <div>
        <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Onboarding</span>
        <h3 className="text-lg font-bold text-foreground mt-1 leading-tight">30-min Kickoff Call</h3>
        <p className="text-sm text-muted-foreground mt-1">Review your goals, walk through ad creatives and funnel, and set up tracking.</p>
      </div>
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Clock className="w-4 h-4 text-primary" /></div>
          <span>30 Minutes</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Video className="w-4 h-4 text-primary" /></div>
          <span>Zoom Video Call</span>
        </div>
        {selectedDate && (
          <div className="flex items-center gap-3 text-foreground font-medium">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><CalendarIcon className="w-4 h-4 text-primary" /></div>
            <span>{format(selectedDate, 'EEE, MMM d, yyyy')}{selectedTime && ` at ${selectedTime}`}</span>
          </div>
        )}
      </div>
      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-semibold text-foreground mb-2">What we'll cover:</h4>
        <ul className="space-y-2">
          {[
            'Review your goals and target investor profile',
            'Walk through your ad creatives and funnel',
            'Set up tracking and KPI benchmarks',
            'Answer any questions about the process',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
