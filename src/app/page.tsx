'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { MapPinned } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addDays } from 'date-fns';

import { getPrediction, type State } from '@/app/actions';
import { FilterPanel, type FormValues } from '@/components/filter-panel';
import { IndiaMap } from '@/components/india-map';
import { ForecastDisplay } from '@/components/forecast-display';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { IndiaGate } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  state: z.string().min(1, 'Please select a state from the map.'),
  lat: z.coerce.number(),
  lon: z.coerce.number(),
  predictionDate: z.date({
    required_error: 'A prediction date is required.',
  }),
  model: z.string(),
});

function PageForm({
  children,
  dispatch,
}: {
  children: React.ReactNode;
  dispatch: (payload: FormData) => void;
}) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const { pending } = useFormStatus();

  React.useEffect(() => {
    if (!pending) {
      //
    }
  }, [pending]);

  return (
    <form
      ref={formRef}
      action={(formData: FormData) => {
        dispatch(formData);
      }}
    >
      {children}
    </form>
  );
}


export default function Home() {
  const initialState: State = {};
  const [state, dispatch] = useActionState(getPrediction, initialState);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      state: '',
      lat: 20.5937,
      lon: 78.9629,
      predictionDate: addDays(new Date(), 7),
      model: 'Auto',
    },
  });

  const handleLocationSelect = React.useCallback(
    (location: { lat: number; lng: number; state: string }) => {
      form.setValue('lat', location.lat);
      form.setValue('lon', location.lng);
      form.setValue('state', location.state, { shouldValidate: true });
    },
    [form]
  );
  
  const lat = form.watch('lat');
  const lon = form.watch('lon');

  React.useEffect(() => {
    if (state.errors) {
      const errorValues = Object.values(state.errors).flat();
      if (errorValues.length > 0 && errorValues[0]) {
        toast({
          variant: 'destructive',
          title: 'An error occurred',
          description: errorValues[0],
        });
      }
    }
  }, [state.errors, toast]);

  return (
    <SidebarProvider>
      <Sidebar>
        <PageForm dispatch={dispatch}>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <IndiaGate className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-semibold font-headline">
                IndiaForecaster
              </h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <FilterPanel form={form} errors={state?.errors} />
          </SidebarContent>
        </PageForm>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center justify-between border-b bg-card p-2 md:hidden">
          <div className="flex items-center gap-2">
            <IndiaGate className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold font-headline">
              IndiaForecaster
            </h1>
          </div>
          <SidebarTrigger size="icon" variant="outline">
              <MapPinned />
          </SidebarTrigger>
        </header>

        <main className="relative flex-1">
          <IndiaMap onLocationSelect={handleLocationSelect} lat={lat} lon={lon} />
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-background/80 via-background/50 to-transparent p-4 backdrop-blur-sm">
              {state.data ? (
                  <ForecastDisplay result={state.data} />
              ) : (
                  <div className="flex min-h-[40vh] items-center justify-center rounded-lg border border-dashed bg-card/50 p-4 text-center text-muted-foreground">
                      <p>Select a location and date to see the forecast</p>
                  </div>
              )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
