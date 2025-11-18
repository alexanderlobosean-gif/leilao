"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Lot } from '@/services/lotService';

// Esquema de validação com Zod
const lotFormSchema = z.object({
  title: z.string().min(1, { message: "Título é obrigatório." }),
  short_description: z.string().min(1, { message: "Descrição curta é obrigatória." }),
  image_url: z
    .string()
    .url({ message: "URL da imagem inválida." })
    .min(1, { message: "URL da imagem é obrigatória." }),
  initial_bid: z.coerce.number().min(0.01, { message: "Lance inicial deve ser positivo." }),
  ends_at: z.date({ required_error: "Data de encerramento é obrigatória." }),
  status: z.enum(["aberto", "finalizado"], { required_error: "Status é obrigatório." }),
  description: z.string().min(1, { message: "Descrição completa é obrigatória." }),
  category_id: z.string().uuid({ message: "Categoria é obrigatória." }),
});

type LotFormValues = z.infer<typeof lotFormSchema>;

interface LotFormProps {
  initialData?: Lot; // Para edição
  onSubmit: (data: LotFormValues) => void;
  onCancel: () => void;
  isLoading: boolean;
  categories?: { id: string; slug: string; name: string }[];
}

const LotForm: React.FC<LotFormProps> = ({ initialData, onSubmit, onCancel, isLoading, categories }) => {
  const safeCategories = categories || [];
  const form = useForm<LotFormValues>({
    resolver: zodResolver(lotFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      short_description: initialData?.short_description || '',
      image_url: initialData?.image_url || '',
      initial_bid: initialData?.initial_bid || 0,
      ends_at: initialData?.ends_at ? new Date(initialData.ends_at) : undefined,
      status: initialData?.status || 'aberto',
      description: initialData?.description || '',
      category_id: initialData?.category_id || '',
    },
    mode: "onChange",
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          placeholder="Ex: Trator Agrícola John Deere"
          {...form.register("title")}
          disabled={isLoading}
        />
        {form.formState.errors.title && (
          <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="category_id">Categoria</Label>
        <Select
          value={form.watch("category_id")}
          onValueChange={(value) => form.setValue("category_id", value as any, { shouldValidate: true })}
          disabled={isLoading}
        >
          <SelectTrigger id="category_id" className="w-full">
            <SelectValue placeholder="Selecione a categoria" />
          </SelectTrigger>
          <SelectContent>
            {safeCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.category_id && (
          <p className="text-red-500 text-sm">{form.formState.errors.category_id.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="short_description">Descrição Curta</Label>
        <Textarea
          id="short_description"
          placeholder="Uma breve descrição do lote."
          {...form.register("short_description")}
          disabled={isLoading}
        />
        {form.formState.errors.short_description && (
          <p className="text-red-500 text-sm">{form.formState.errors.short_description.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="image_url">URL da Imagem</Label>
        <Input
          id="image_url"
          type="url"
          placeholder="https://exemplo.com/imagem.jpg"
          {...form.register("image_url")}
          disabled={isLoading}
        />
        {form.formState.errors.image_url && (
          <p className="text-red-500 text-sm">{form.formState.errors.image_url.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="initial_bid">Lance Inicial (R$)</Label>
        <Input
          id="initial_bid"
          type="number"
          step="0.01"
          placeholder="1000.00"
          {...form.register("initial_bid")}
          disabled={isLoading}
        />
        {form.formState.errors.initial_bid && (
          <p className="text-red-500 text-sm">{form.formState.errors.initial_bid.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="ends_at">Encerra em</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !form.watch("ends_at") && "text-muted-foreground"
              )}
              disabled={isLoading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {form.watch("ends_at") ? format(form.watch("ends_at"), "PPP HH:mm") : <span>Selecione uma data e hora</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={form.watch("ends_at")}
              onSelect={(date) => {
                if (date) {
                  // Manter a hora atual se a data for selecionada, ou definir para meia-noite se for uma nova seleção
                  const existingDate = form.getValues("ends_at");
                  const newDate = new Date(date);
                  if (existingDate) {
                    newDate.setHours(existingDate.getHours());
                    newDate.setMinutes(existingDate.getMinutes());
                  } else {
                    newDate.setHours(23); // Default to end of day
                    newDate.setMinutes(59);
                  }
                  form.setValue("ends_at", newDate, { shouldValidate: true });
                }
              }}
              initialFocus
            />
            <div className="p-3 border-t border-border">
              <Label htmlFor="time-input" className="sr-only">Hora</Label>
              <Input
                id="time-input"
                type="time"
                value={form.watch("ends_at") ? format(form.watch("ends_at"), "HH:mm") : ''}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':').map(Number);
                  const currentEndsAt = form.getValues("ends_at") || new Date();
                  currentEndsAt.setHours(hours);
                  currentEndsAt.setMinutes(minutes);
                  form.setValue("ends_at", currentEndsAt, { shouldValidate: true });
                }}
                disabled={isLoading}
              />
            </div>
          </PopoverContent>
        </Popover>
        {form.formState.errors.ends_at && (
          <p className="text-red-500 text-sm">{form.formState.errors.ends_at.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="status">Status</Label>
        <Select
          onValueChange={(value: "aberto" | "finalizado") => form.setValue("status", value, { shouldValidate: true })}
          value={form.watch("status")}
          disabled={isLoading}
        >
          <SelectTrigger id="status" className="w-full">
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aberto">Aberto</SelectItem>
            <SelectItem value="finalizado">Finalizado</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.status && (
          <p className="text-red-500 text-sm">{form.formState.errors.status.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Descrição Completa</Label>
        <Textarea
          id="description"
          placeholder="Detalhes completos do lote, especificações, etc."
          rows={5}
          {...form.register("description")}
          disabled={isLoading}
        />
        {form.formState.errors.description && (
          <p className="text-red-500 text-sm">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando...
            </>
          ) : (
            "Salvar Lote"
          )}
        </Button>
      </div>
    </form>
  );
};

export default LotForm;