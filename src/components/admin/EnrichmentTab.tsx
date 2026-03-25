import { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, Loader2, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UploadedContact {
  name: string;
  email: string;
  phone: string;
  phone2: string;
  email2: string;
  enrichmentStatus: 'pending' | 'enriching' | 'verified' | 'spouse' | 'no-match' | 'error';
  tier?: string;
  score?: number;
  financial?: Record<string, unknown> | null;
  identity?: Record<string, unknown> | null;
  address?: Record<string, unknown> | null;
}

function parseCSV(text: string): UploadedContact[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));

  const nameIdx = headers.findIndex(h => h.includes('name'));
  const emailIdx = headers.findIndex(h => h === 'email' || h === 'e-mail');
  const phoneIdx = headers.findIndex(h => h === 'phone' || h === 'phone1' || h === 'phone 1');
  const phone2Idx = headers.findIndex(h => h === 'phone2' || h === 'phone 2' || h === 'secondary phone');
  const email2Idx = headers.findIndex(h => h === 'email2' || h === 'email 2' || h === 'secondary email');

  return lines.slice(1).filter(l => l.trim()).map(line => {
    const cols = line.split(',').map(c => c.trim().replace(/^['"]|['"]$/g, ''));
    return {
      name: cols[nameIdx] || '',
      email: emailIdx >= 0 ? cols[emailIdx] || '' : '',
      phone: phoneIdx >= 0 ? cols[phoneIdx] || '' : '',
      phone2: phone2Idx >= 0 ? cols[phone2Idx] || '' : '',
      email2: email2Idx >= 0 ? cols[email2Idx] || '' : '',
      enrichmentStatus: 'pending' as const,
    };
  }).filter(c => c.name || c.email || c.phone);
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-muted text-muted-foreground', icon: null },
  enriching: { label: 'Enriching…', color: 'bg-amber-500/10 text-amber-600', icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  verified: { label: 'Verified', color: 'bg-emerald-500/10 text-emerald-600', icon: <CheckCircle className="h-3 w-3" /> },
  spouse: { label: 'Spouse Match', color: 'bg-blue-500/10 text-blue-600', icon: <CheckCircle className="h-3 w-3" /> },
  'no-match': { label: 'No Match', color: 'bg-destructive/10 text-destructive', icon: <AlertCircle className="h-3 w-3" /> },
  error: { label: 'Error', color: 'bg-destructive/10 text-destructive', icon: <AlertCircle className="h-3 w-3" /> },
};

export function EnrichmentTab() {
  const [contacts, setContacts] = useState<UploadedContact[]>([]);
  const [enriching, setEnriching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        toast({ title: 'No valid contacts found', description: 'Ensure CSV has name, email, or phone columns.', variant: 'destructive' });
        return;
      }
      setContacts(parsed);
      setProgress(0);
      // Default file name from uploaded file
      const baseName = file.name.replace(/\.csv$/i, '');
      setFileName(`${baseName}-enriched`);
      toast({ title: `${parsed.length} contacts loaded`, description: 'Ready to enrich.' });
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  const enrichAll = async () => {
    setEnriching(true);
    let completed = 0;

    for (let i = 0; i < contacts.length; i++) {
      const c = contacts[i];
      if (c.enrichmentStatus !== 'pending') {
        completed++;
        continue;
      }

      setContacts(prev => prev.map((p, idx) => idx === i ? { ...p, enrichmentStatus: 'enriching' } : p));

      try {
        const { data, error } = await supabase.functions.invoke('retargetiq-enrich', {
          body: { name: c.name, email: c.email, phone: c.phone, phone2: c.phone2, email2: c.email2, mode: 'inline' },
        });

        if (error) throw error;

        setContacts(prev => prev.map((p, idx) =>
          idx === i ? {
            ...p,
            enrichmentStatus: data?.status || 'no-match',
            tier: data?.tier,
            score: data?.score,
            financial: data?.financial,
            identity: data?.identity,
            address: data?.address,
          } : p
        ));
      } catch {
        setContacts(prev => prev.map((p, idx) => idx === i ? { ...p, enrichmentStatus: 'error' } : p));
      }

      completed++;
      setProgress(Math.round((completed / contacts.length) * 100));
    }

    setEnriching(false);
    toast({ title: 'Enrichment complete' });
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Phone 2', 'Email 2', 'Status', 'Tier', 'Score', 'Net Worth', 'Income', 'Credit Range', 'City', 'State'];
    const rows = contacts.map(c => [
      c.name,
      c.email,
      c.phone,
      c.phone2,
      c.email2,
      c.enrichmentStatus,
      c.tier || '',
      c.score?.toString() || '',
      (c.financial as any)?.householdNetWorth || '',
      (c.financial as any)?.householdIncome || '',
      (c.financial as any)?.creditRange || '',
      (c.address as any)?.city || '',
      (c.address as any)?.state || '',
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const exportName = fileName.trim() || `enriched-leads-${new Date().toISOString().split('T')[0]}`;
    a.download = `${exportName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const enrichedCount = contacts.filter(c => ['verified', 'spouse'].includes(c.enrichmentStatus)).length;
  const noMatchCount = contacts.filter(c => c.enrichmentStatus === 'no-match').length;
  const processedCount = contacts.filter(c => !['pending', 'enriching'].includes(c.enrichmentStatus)).length;
  const enrichmentPct = contacts.length > 0 ? Math.round((enrichedCount / contacts.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
        <CardContent className="p-8 text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Upload Contact List</h3>
            <p className="text-sm text-muted-foreground">CSV with name, email, phone, phone2, email2 columns</p>
          </div>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          <Button onClick={() => fileRef.current?.click()} variant="outline" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Choose CSV File
          </Button>
        </CardContent>
      </Card>

      {contacts.length > 0 && (
        <>
          {/* Stats & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-3 flex-wrap">
              <Badge variant="outline" className="gap-1 py-1 px-3">
                {contacts.length} Total
              </Badge>
              <Badge variant="outline" className="gap-1 py-1 px-3 bg-emerald-500/10 text-emerald-600 border-emerald-200">
                <CheckCircle className="h-3 w-3" /> {enrichedCount} Enriched
              </Badge>
              <Badge variant="outline" className="gap-1 py-1 px-3 bg-destructive/10 text-destructive border-destructive/20">
                <AlertCircle className="h-3 w-3" /> {noMatchCount} No Match
              </Badge>
              {processedCount > 0 && (
                <Badge variant="outline" className="gap-1 py-1 px-3 bg-primary/10 text-primary border-primary/20 font-semibold">
                  {enrichmentPct}% Enriched
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={enrichAll} disabled={enriching} className="gap-2">
                {enriching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {enriching ? 'Enriching…' : 'Enrich All'}
              </Button>
              <Button onClick={() => { setContacts([]); setProgress(0); setFileName(''); }} variant="ghost" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {enriching && <Progress value={progress} className="h-2" />}

          {/* Contacts Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact List</CardTitle>
              <CardDescription>{contacts.length} contacts loaded</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Net Worth</TableHead>
                      <TableHead>Income</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((c, i) => {
                      const st = statusConfig[c.enrichmentStatus] || statusConfig.pending;
                      return (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{c.name || '—'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{c.email || '—'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{c.phone || '—'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`gap-1 ${st.color}`}>
                              {st.icon} {st.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {c.tier ? (
                              <Badge variant="outline" className={
                                c.tier === 'qualified' ? 'bg-emerald-500/10 text-emerald-600' :
                                c.tier === 'borderline' ? 'bg-amber-500/10 text-amber-600' :
                                'bg-muted text-muted-foreground'
                              }>
                                {c.tier}
                              </Badge>
                            ) : '—'}
                          </TableCell>
                          <TableCell>{c.score ?? '—'}</TableCell>
                          <TableCell className="text-sm">{(c.financial as any)?.householdNetWorth || '—'}</TableCell>
                          <TableCell className="text-sm">{(c.financial as any)?.householdIncome || '—'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Export Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Export Enriched List</CardTitle>
              <CardDescription>
                {processedCount > 0
                  ? `${enrichmentPct}% of contacts were successfully enriched (${enrichedCount}/${contacts.length})`
                  : 'Run enrichment first, then export your results'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="file-name">File Name</Label>
                  <Input
                    id="file-name"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="enriched-leads"
                  />
                </div>
                <span className="text-sm text-muted-foreground pb-2">.csv</span>
                <Button onClick={exportCSV} variant="outline" className="gap-2" disabled={processedCount === 0}>
                  <Download className="h-4 w-4" /> Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
