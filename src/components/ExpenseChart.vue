<template>
    <div class="expense-chart">
        <canvas ref="chartCanvas"></canvas>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
    data: Object
})

const chartCanvas = ref(null)

// Simple bar chart using canvas API
const drawChart = () => {
    const canvas = chartCanvas.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const categories = Object.keys(props.data)
    const values = Object.values(props.data)
    const max = Math.max(...values, 1)

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = 300

    const barWidth = (canvas.width - 80) / categories.length
    const chartHeight = canvas.height - 60

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw bars
    categories.forEach((cat, i) => {
        const height = (values[i] / max) * chartHeight
        const x = 40 + i * barWidth + barWidth * 0.1
        const y = canvas.height - 40 - height

        // Bar
        const gradient = ctx.createLinearGradient(0, y, 0, y + height)
        gradient.addColorStop(0, '#0d6efd')
        gradient.addColorStop(1, '#0dcaf0')

        ctx.fillStyle = gradient
        ctx.fillRect(x, y, barWidth * 0.8, height)

        // Label
        ctx.fillStyle = '#6c757d'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(cat, x + barWidth * 0.4, canvas.height - 20)

        // Value
        ctx.fillStyle = '#0d6efd'
        ctx.font = 'bold 12px sans-serif'
        ctx.fillText('$' + values[i].toFixed(0), x + barWidth * 0.4, y - 5)
    })
}

onMounted(drawChart)
watch(() => props.data, drawChart, { deep: true })
</script>

<style scoped>
canvas {
    width: 100%;
    height: 300px;
}
</style>