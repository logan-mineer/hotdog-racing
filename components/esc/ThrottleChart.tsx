'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { throttleCurve } from '@/lib/esc/model'
import type { ThrottleCurveParams, ThrottlePoint } from '@/lib/esc/model'

type Props = {
  params: ThrottleCurveParams
}

export default function ThrottleChart({ params }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const updateRef = useRef<((containerX: number) => void) | null>(null)
  const hideRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const container = containerRef.current
    const svgEl = svgRef.current
    if (!container || !svgEl) return

    function draw() {
      const { width, height } = container!.getBoundingClientRect()
      if (width === 0 || height === 0) return

      const margin = { top: 12, right: 24, bottom: 36, left: 48 }
      const innerW = width - margin.left - margin.right
      const innerH = height - margin.top - margin.bottom

      const data = throttleCurve(params)

      const x = d3.scaleLinear().domain([0, 100]).range([0, innerW])
      const y = d3.scaleLinear().domain([0, 100]).range([innerH, 0])

      const svg = d3.select(svgEl)
      svg.attr('width', width).attr('height', height).selectAll('*').remove()

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

      // Gridlines
      g.append('g')
        .attr('class', 'grid')
        .call(
          d3.axisLeft(y)
            .ticks(5)
            .tickSize(-innerW)
            .tickFormat(() => ''),
        )
        .select('.domain').remove()
      g.selectAll('.grid .tick line').style('stroke', 'var(--border)').style('stroke-opacity', '0.5')

      // Dead band shaded region
      const deadBandWidth = x(params.freeZoneAdjust)
      if (deadBandWidth > 0) {
        g.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', deadBandWidth)
          .attr('height', innerH)
          .style('fill', 'var(--muted)')
          .style('opacity', '0.08')
      }

      // X axis
      const xAxisG = g.append('g').attr('transform', `translate(0,${innerH})`)
      xAxisG.call(d3.axisBottom(x).ticks(6).tickFormat(d => `${d}%`))
      xAxisG.selectAll('text')
        .style('fill', 'var(--muted)')
        .style('font-size', '10px')
        .style('font-family', 'var(--font-mono, monospace)')
      xAxisG.select('.domain').style('stroke', 'var(--border)')
      xAxisG.selectAll('.tick line').style('stroke', 'var(--border)')

      // Y axis
      const yAxisG = g.append('g')
      yAxisG.call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`))
      yAxisG.selectAll('text')
        .style('fill', 'var(--muted)')
        .style('font-size', '10px')
        .style('font-family', 'var(--font-mono, monospace)')
      yAxisG.select('.domain').style('stroke', 'var(--border)')
      yAxisG.selectAll('.tick line').style('stroke', 'var(--border)')

      // X axis label
      g.append('text')
        .attr('x', innerW / 2)
        .attr('y', innerH + 28)
        .attr('text-anchor', 'middle')
        .style('fill', 'var(--muted)')
        .style('font-size', '10px')
        .style('font-family', 'var(--font-mono, monospace)')
        .text('Throttle Stick (%)')

      // Y axis label
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerH / 2)
        .attr('y', -36)
        .attr('text-anchor', 'middle')
        .style('fill', 'var(--muted)')
        .style('font-size', '10px')
        .style('font-family', 'var(--font-mono, monospace)')
        .text('Motor Power (%)')

      // Power curve
      const line = d3.line<ThrottlePoint>()
        .x(d => x(d.stick))
        .y(d => y(d.power))

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('d', line)
        .style('stroke', '#FF0020')
        .style('stroke-width', '2')

      // Crosshair and hover dot
      const crosshair = g.append('line')
        .attr('y1', 0).attr('y2', innerH)
        .style('stroke', 'var(--foreground)').style('stroke-width', '1')
        .style('stroke-dasharray', '3 2').style('opacity', '0')
        .style('pointer-events', 'none')

      const dot = g.append('circle').attr('r', 4)
        .style('fill', '#FF0020').style('stroke', 'var(--surface)').style('stroke-width', '2')
        .style('opacity', '0').style('pointer-events', 'none')

      const bisect = d3.bisector((d: ThrottlePoint) => d.stick).left

      updateRef.current = (containerX: number) => {
        const innerX = containerX - margin.left
        const stickVal = x.invert(Math.max(0, Math.min(innerW, innerX)))
        const i = bisect(data, stickVal, 1, data.length - 1)
        const pt = stickVal - data[i - 1].stick <= data[i].stick - stickVal ? data[i - 1] : data[i]
        const dotX = x(pt.stick)

        crosshair.attr('x1', dotX).attr('x2', dotX).style('opacity', '0.6')
        dot.attr('cx', dotX).attr('cy', y(pt.power)).style('opacity', '1')

        const tt = tooltipRef.current
        if (!tt) return
        tt.innerHTML = `<div>Stick ${pt.stick.toFixed(0)}%</div><div>Power ${pt.power.toFixed(1)}%</div>`
        const tipW = tt.offsetWidth
        const rawLeft = margin.left + dotX + 12
        tt.style.left = `${rawLeft + tipW > width ? Math.max(0, margin.left + dotX - tipW - 12) : rawLeft}px`
        tt.style.top = `${margin.top + 4}px`
        tt.style.opacity = '1'
      }

      hideRef.current = () => {
        crosshair.style('opacity', '0')
        dot.style('opacity', '0')
        const tt = tooltipRef.current
        if (tt) tt.style.opacity = '0'
      }
    }

    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(container)
    return () => ro.disconnect()
  }, [params])

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <svg ref={svgRef} />
      <div
        className="absolute inset-0 touch-none"
        onPointerDown={(e) => {
          if (e.pointerType !== 'mouse') e.currentTarget.setPointerCapture(e.pointerId)
          updateRef.current?.(e.nativeEvent.offsetX)
        }}
        onPointerMove={(e) => updateRef.current?.(e.nativeEvent.offsetX)}
        onPointerUp={(e) => { if (e.pointerType !== 'mouse') hideRef.current?.() }}
        onPointerLeave={(e) => { if (e.pointerType === 'mouse') hideRef.current?.() }}
        onPointerCancel={() => hideRef.current?.()}
      />
      <div
        ref={tooltipRef}
        className="pointer-events-none absolute z-10 rounded text-[10px] font-mono leading-relaxed opacity-0"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
          padding: '4px 8px',
          whiteSpace: 'nowrap',
          transition: 'opacity 80ms',
        }}
      />
    </div>
  )
}
