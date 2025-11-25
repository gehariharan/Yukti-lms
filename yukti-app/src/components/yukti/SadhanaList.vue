<script setup>
import { computed } from 'vue'
import { useGuruStore } from '@/stores/guruStore'
import Card from '@/components/ui/card/Card.vue'
import { Check, Circle } from 'lucide-vue-next'

const guruStore = useGuruStore()

const sadhanaItems = computed(() => guruStore.sadhanaItems)
const hasSadhana = computed(() => sadhanaItems.value.length > 0)

function toggleItem(id) {
  guruStore.toggleSadhanaItem(id)
}
</script>

<template>
  <div v-if="hasSadhana" class="w-full">
    <Card class="bg-gradient-to-br from-yukti-saffron/5 to-transparent border-yukti-saffron/20">
      <div class="p-6">
        <div class="mb-4">
          <div class="inline-block px-3 py-1 bg-yukti-saffron/20 rounded-full mb-2">
            <span class="text-xs font-semibold text-yukti-saffron uppercase tracking-wider">
              Your Sadhana
            </span>
          </div>
          <h3 class="text-lg font-bold text-foreground">
            Action Items
          </h3>
          <p class="text-sm text-yukti-slate mt-1">
            Excellence in Action (Yoga Karmasu Kaushalam)
          </p>
        </div>

        <div class="space-y-3">
          <div
            v-for="item in sadhanaItems"
            :key="item.id"
            @click="toggleItem(item.id)"
            class="flex items-start gap-3 p-3 rounded-lg hover:bg-yukti-saffron/5 transition-colors cursor-pointer group"
          >
            <div class="flex-shrink-0 mt-0.5">
              <div
                :class="[
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                  item.completed
                    ? 'bg-yukti-saffron border-yukti-saffron'
                    : 'border-yukti-slate/30 group-hover:border-yukti-saffron/50'
                ]"
              >
                <Check
                  v-if="item.completed"
                  :size="14"
                  class="text-white"
                />
              </div>
            </div>
            <div class="flex-1">
              <p
                :class="[
                  'text-sm leading-relaxed transition-all',
                  item.completed
                    ? 'text-yukti-slate/60 line-through'
                    : 'text-foreground'
                ]"
              >
                {{ item.text }}
              </p>
            </div>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-yukti-saffron/20">
          <p class="text-xs text-yukti-slate text-center italic">
            "The wise see knowledge and action as one." - Bhagavad Gita
          </p>
        </div>
      </div>
    </Card>
  </div>
</template>
