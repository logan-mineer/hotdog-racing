'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { brakeCurve } from '@/lib/esc/model'
import type { BrakeCurveParams } from '@/lib/esc/model'

type Props = {
  params: BrakeCurveParams
}

export default function BrakeChart({ params }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

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

      const data = brakeCurve(params)

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
        .text('Brake Input (%)')

      // Y axis label
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerH / 2)
        .attr('y', -36)
        .attr('text-anchor', 'middle')
        .style('fill', 'var(--muted)')
        .style('font-size', '10px')
        .style('font-family', 'var(--font-mono, monospace)')
        .text('Braking Force (%)')

      // Brake force curve
      const line = d3.line<{ input: number; force: number }>()
        .x(d => x(d.input))
        .y(d => y(d.force))

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('d', line)
        .style('stroke', '#FF0020')
        .style('stroke-width', '2')

      // Anchor point markers
      const anchors = [
        { input: 0, force: params.neutralBrakePower },
        { input: 5, force: params.initialBrakePower },
        { input: 100, force: params.fullBrakePower },
      ]

      g.selectAll<SVGCircleElement, typeof anchors[number]>('circle.anchor')
        .data(anchors)
        .enter()
        .append('circle')
        .attr('class', 'anchor')
        .attr('cx', d => x(d.input))
        .attr('cy', d => y(d.force))
        .attr('r', 4)
        .style('fill', '#FF0020')
        .style('stroke', 'var(--surface)')
        .style('stroke-width', '2')
    }

    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(container)
    return () => ro.disconnect()
  }, [params])

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg ref={svgRef} />
    </div>
  )
}
