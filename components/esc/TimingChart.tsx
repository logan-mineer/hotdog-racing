'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { torquePowerCurve } from '@/lib/esc/model'
import type { TorquePowerParams } from '@/lib/esc/model'

type Props = {
  params: TorquePowerParams
  revLimitEnabled: boolean
  revLimitRPM: number
  accentColor?: string
  ghostColor?: string
}

export default function TimingChart({
  params,
  revLimitEnabled,
  revLimitRPM,
  accentColor = '#FF0020',
  ghostColor,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const svgEl = svgRef.current
    if (!container || !svgEl) return

    function draw() {
      const { width, height } = container!.getBoundingClientRect()
      if (width === 0 || height === 0) return

      const margin = { top: 12, right: 48, bottom: 36, left: 48 }
      const innerW = width - margin.left - margin.right
      const innerH = height - margin.top - margin.bottom

      const live = torquePowerCurve(params)
      const ref = torquePowerCurve({ ...params, motorCanTiming: 0, boostTiming: 0, turboTiming: 0, turboActive: false })
      const ghost = params.turboActive ? torquePowerCurve({ ...params, turboActive: false }) : null
      const maxRPM = live[live.length - 1].rpm

      const x = d3.scaleLinear().domain([0, maxRPM]).range([0, innerW])
      const yL = d3.scaleLinear().domain([0, 100]).range([innerH, 0])
      const yR = d3.scaleLinear().domain([0, 100]).range([innerH, 0])

      const svg = d3.select(svgEl)
      svg.attr('width', width).attr('height', height).selectAll('*').remove()

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

      // Gridlines
      g.append('g')
        .attr('class', 'grid')
        .call(
          d3.axisLeft(yL)
            .ticks(5)
            .tickSize(-innerW)
            .tickFormat(() => ''),
        )
        .select('.domain').remove()
      g.selectAll('.grid .tick line').style('stroke', 'var(--border)').style('stroke-opacity', '0.5')

      // X axis
      const xAxisG = g.append('g').attr('transform', `translate(0,${innerH})`)
      xAxisG.call(
        d3.axisBottom(x)
          .ticks(6)
          .tickFormat(d => `${(+d / 1000).toFixed(0)}k`),
      )
      xAxisG.selectAll('text')
        .style('fill', 'var(--muted)')
        .style('font-size', '10px')
        .style('font-family', 'var(--font-mono, monospace)')
      xAxisG.select('.domain').style('stroke', 'var(--border)')
      xAxisG.selectAll('.tick line').style('stroke', 'var(--border)')

      // Y axis left (torque)
      const yLAxisG = g.append('g')
      yLAxisG.call(d3.axisLeft(yL).ticks(5).tickFormat(d => `${d}%`))
      yLAxisG.selectAll('text')
        .style('fill', 'var(--muted)')
        .style('font-size', '10px')
        .style('font-family', 'var(--font-mono, monospace)')
      yLAxisG.select('.domain').style('stroke', 'var(--border)')
      yLAxisG.selectAll('.tick line').style('stroke', 'var(--border)')

      // Y axis right (power)
      const yRAxisG = g.append('g').attr('transform', `translate(${innerW},0)`)
      yRAxisG.call(d3.axisRight(yR).ticks(5).tickFormat(d => `${d}%`))
      yRAxisG.selectAll('text')
        .style('fill', 'var(--muted)')
        .style('font-size', '10px')
        .style('font-family', 'var(--font-mono, monospace)')
      yRAxisG.select('.domain').style('stroke', 'var(--border)')
      yRAxisG.selectAll('.tick line').style('stroke', 'var(--border)')

      // X axis label
      g.append('text')
        .attr('x', innerW / 2)
        .attr('y', innerH + 28)
        .attr('text-anchor', 'middle')
        .style('fill', 'var(--muted)')
        .style('font-size', '10px')
        .style('font-family', 'var(--font-mono, monospace)')
        .text('Motor RPM')

      const torqueLine = d3.line<{ rpm: number; torque: number; power: number }>()
        .x(d => x(d.rpm))
        .y(d => yL(d.torque))

      const powerLine = d3.line<{ rpm: number; torque: number; power: number }>()
        .x(d => x(d.rpm))
        .y(d => yR(d.power))

      // 0° timing reference — gray, solid torque + dashed power
      g.append('path')
        .datum(ref)
        .attr('fill', 'none')
        .attr('d', torqueLine)
        .style('stroke', 'var(--muted)')
        .style('stroke-width', '1.5')
        .style('stroke-opacity', '0.55')

      g.append('path')
        .datum(ref)
        .attr('fill', 'none')
        .attr('d', powerLine)
        .style('stroke', 'var(--muted)')
        .style('stroke-width', '1.5')
        .style('stroke-opacity', '0.55')
        .style('stroke-dasharray', '6 3')

      // No-turbo ghost — complement color, solid torque + dashed power
      if (ghost && ghostColor) {
        g.append('path')
          .datum(ghost)
          .attr('fill', 'none')
          .attr('d', torqueLine)
          .style('stroke', ghostColor)
          .style('stroke-width', '1.5')

        g.append('path')
          .datum(ghost)
          .attr('fill', 'none')
          .attr('d', powerLine)
          .style('stroke', ghostColor)
          .style('stroke-width', '1.5')
          .style('stroke-dasharray', '6 3')
      }

      // Rev limit vertical line
      if (revLimitEnabled && revLimitRPM <= maxRPM) {
        g.append('line')
          .attr('x1', x(revLimitRPM))
          .attr('x2', x(revLimitRPM))
          .attr('y1', 0)
          .attr('y2', innerH)
          .style('stroke', accentColor)
          .style('stroke-width', '1.5')
          .style('stroke-dasharray', '4 3')
          .style('stroke-opacity', '0.7')
      }

      // Live torque (solid)
      g.append('path')
        .datum(live)
        .attr('fill', 'none')
        .attr('d', torqueLine)
        .style('stroke', accentColor)
        .style('stroke-width', '2')

      // Live power (dashed)
      g.append('path')
        .datum(live)
        .attr('fill', 'none')
        .attr('d', powerLine)
        .style('stroke', accentColor)
        .style('stroke-width', '2')
        .style('stroke-dasharray', '6 3')
    }

    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(container)
    return () => ro.disconnect()
  }, [params, revLimitEnabled, revLimitRPM, accentColor, ghostColor])

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg ref={svgRef} />
    </div>
  )
}
