'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { MapPinned } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addDays } from 'date-fns';
import dynamic from 'next/dynamic';

import { getPrediction, type State } from '@/app/actions';
import { FilterPanel, type FormValues } from '@/components/filter-panel';
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
import { DraggableResizablePanel } from '@/components/draggable-resizable-panel';

// Dynamically import the map component to avoid SSR issues
const IndiaMap = dynamic(() => import('@/components/india-map').then(mod => mod.IndiaMap), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse" />,
});


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
  form,
}: {
  children: React.ReactNode;
  dispatch: (payload: FormData) => void;
  form: any;
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
      action={async (formData: FormData) => {
        // Get the current form values from React Hook Form
        const currentValues = form.getValues();
        
        // Create a new FormData with the current values
        const newFormData = new FormData();
        newFormData.append('state', currentValues.state);
        newFormData.append('lat', currentValues.lat.toString());
        newFormData.append('lon', currentValues.lon.toString());
        newFormData.append('predictionDate', currentValues.predictionDate.toISOString());
        newFormData.append('model', currentValues.model);
        
        dispatch(newFormData);
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
      state: 'Maharashtra',
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
      if (location.state && location.state !== 'Unknown') {
        form.setValue('state', location.state, { shouldValidate: true });
      }
    },
    [form]
  );
  
  const lat = form.watch('lat');
  const lon = form.watch('lon');
  const selectedState = form.watch('state');

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
        <PageForm dispatch={dispatch} form={form}>
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
        <header className="flex h-12 shrink-0 items-center justify-between border-b bg-card p-2 md:hidden">
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

        <main className="relative flex flex-1 flex-col overflow-hidden">
          <div className="absolute inset-0">
            <IndiaMap 
              onLocationSelect={handleLocationSelect} 
              lat={lat} 
              lon={lon}
              selectedState={selectedState}
            />
          </div>
          <DraggableResizablePanel
            initialPosition={{ x: 30, y: 30 }}
            initialSize={{ width: '80vw', height: 'auto' }}
            title="Forecast"
          >
            {state.data ? (
                <ForecastDisplay result={state.data} />
            ) : (
                <div className="flex min-h-[20vh] items-center justify-center rounded-lg p-4 text-center text-muted-foreground">
                    <p>Select a location and date to see the forecast</p>
                </div>
            )}
          </DraggableResizablePanel>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
