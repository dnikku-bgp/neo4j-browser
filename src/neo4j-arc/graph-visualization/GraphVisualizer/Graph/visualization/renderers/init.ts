/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { BaseType } from 'd3-selection'
import { hsl, rgb } from 'd3-color'

import { NodeCaptionLine, NodeModel, NodeTextLine } from '../../../../models/Node'
import { RelationshipModel } from '../../../../models/Relationship'
import Renderer from '../Renderer'

const noop = () => undefined

const nodeRingStrokeSize = 4
const SQRT2 = Math.sqrt(2)
const SQRT3 = Math.sqrt(3)
const SQRT10 = Math.sqrt(10)

const TAN30 = Math.tan(Math.PI / 6)
const COS30 = Math.cos(Math.PI / 6)
const WYE_LEN = 2 / Math.sqrt(1 + Math.pow(2 + TAN30, 2))

const borderColor = (color: string, defaultValue: string) =>
  color ? rgb(color).darker() : defaultValue

// const textColor = (color: any, defaultValue: string) =>
//  color && hsl(color).l < 0.7 ? '#FFFFFF' : '#000000'

const nodeOutline = new Renderer<NodeModel>({
  name: 'nodeOutline',
  onGraphChange(selection, viz) {
    const fill = function (selection2: unknown) {
      selection2
        .attr('fill', (node: NodeModel) => viz.style.forNode(node).get('color'))
        .attr('stroke', (node: NodeModel) => 
          borderColor(viz.style.forNode(node).props['color'], '#000000')
        )
        .attr('stroke-width', (node: NodeModel) => viz.style.forNode(node).get('border-width'))
    }

    selection
      .filter(node => viz.style.forNode(node).props['outline'] == 'square')
      .selectAll('rect.b-outline')
      .data(node => [node])
      .join('rect')
      .classed('b-outline', true)
      .attr('x', (node: NodeModel) => -node.radius / SQRT2)
      .attr('y', (node: NodeModel) => -node.radius / SQRT2)
      .attr('width', (node: NodeModel) => node.radius * 2 / SQRT2)
      .attr('height', (node: NodeModel) => node.radius * 2 / SQRT2)
      .call(fill)

    selection
      .filter(node => viz.style.forNode(node).props['outline'] == 'triangle')
      .selectAll('path.b-outline')
      .data(node => [node])
      .join('path')
      .classed('b-outline', true)
      .attr('d', (node: NodeModel) => {
        const r = node.radius
        const l = SQRT3 * r
        return `M 0 ${-r} L ${-l/2} ${r/2} L ${l/2} ${r/2} Z`
      })
      .call(fill)
    
    selection
      .filter(node => viz.style.forNode(node).props['outline'] == 'hexagon')
      .selectAll('path.b-outline')
      .data(node => [node])
      .join('path')
      .classed('b-outline', true)
      .attr('d', (node: NodeModel) => {
        const r = node.radius
        const l = SQRT3 * r
        return `M 0 ${-r} L ${-l/2} ${-r/2} L ${-l/2} ${r/2} L 0 ${r} L ${l/2} ${r/2} L ${l/2} ${-r/2} Z`
      })
      .call(fill)
    
    selection
      .filter(node => viz.style.forNode(node).props['outline'] == 'cross')
      .selectAll('path.b-outline')
      .data(node => [node])
      .join('path')
      .classed('b-outline', true)
      .attr('d', (node: NodeModel) => {
        const l = node.radius * 2 / SQRT10
        return `M ${-l/2} ${-3*l/2}  l 0 ${l}  l ${-l} 0  l 0 ${l}  l ${l} 0  l 0 ${l}  l ${l} 0`
          + ` l 0 ${-l}  l ${l} 0  l 0 ${-l}  l ${-l} 0  l 0 ${-l}  Z`
      })
      .call(fill)
    
    selection
      .filter(node => viz.style.forNode(node).props['outline'] == 'wye')
      .selectAll('path.b-outline')
      .data(node => [node])
      .join('path')
      .classed('b-outline', true)
      .attr('d', (node: NodeModel) => {
        const l = node.radius * WYE_LEN
        const l_cos30 = l * COS30
        
        return `M ${-l/2} ${-l -l/2 * TAN30} l 0 ${l} l ${-l_cos30} ${l/2}`
          + ` l ${l/2} ${l_cos30} l ${l_cos30} ${-l/2} l ${l_cos30} ${l/2}`
          + ` l ${l/2} ${-l_cos30} l ${-l_cos30} ${-l/2} l 0 ${-l} Z`
      })
      .call(fill)

    
    selection
      .filter(node => viz.style.forNode(node).props['outline'] == 'diamond')
      .selectAll('path.b-outline')
      .data(node => [node])
      .join('path')
      .classed('b-outline', true)
      .attr('d', (node: NodeModel) => {
        const r = node.radius
        return `M 0 ${-r} L ${-r} ${0} L 0 ${r} L ${r} 0 Z`
      })
      .call(fill)

    selection
      .filter(node => (viz.style.forNode(node).props['outline'] ?? 'circle') == 'circle')
      .selectAll('circle.b-outline')
      .data(node => [node])
      .join('circle')
      .classed('b-outline', true)
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', (node: NodeModel) => node.radius)
      .call(fill)
  },
  onTick: noop
})

const nodeOutlineLabel = new Renderer<NodeModel>({
  name: 'nodeOutlineLabel',
  onGraphChange(selection, viz) {
    return (
      selection
        .selectAll('text.b-outline-label')
        .data((node: NodeModel) => [node])
        .join('text')
        .classed('b-outline-label', true)
        .attr('text-anchor', 'middle')
        .attr('pointer-events', 'none')
        .attr('x', 0)
        .attr('y', (node: NodeModel) => node.labelText.height / 2 - 2)
        .attr('font-size', (node: NodeModel) => viz.style.forNode(node).get('font-size'))
        .attr('fill', '#000000')
        .text((node: NodeModel) => node.labelText.text)
    )
  },
  onTick: noop
})

const nodeRing = new Renderer<NodeModel>({
  name: 'nodeRing',
  onGraphChange(selection, viz) {
    return selection
      .selectAll('circle.ring')
      .data(node => [node])
      .join('circle')
      .classed('ring', true)
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('stroke-width', `${nodeRingStrokeSize}px`)
      .attr('r', (node: NodeModel) => 
        node.radius + parseFloat(viz.style.forNode(node).get('border-width')) + 2
      )
  },
  onTick: noop
})

const nodeCaption = new Renderer<NodeModel>({
  name: 'nodeText',
  onGraphChange(selection, viz) {
    const captions = selection
      .filter((node: NodeModel) => node.captionText != null)

    captions
      .selectAll('rect.caption')
      .data((node: NodeModel) => [node])
      .join('rect')
      .classed('caption', true)
      .attr('pointer-events', 'none')
      .attr('x', (node: NodeModel) => - node.captionText!.width / 2)
      .attr('y', (node: NodeModel) => node.radius + 2)
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('width', (node: NodeModel) => node.captionText!.width)
      .attr('height', (node: NodeModel) => node.captionText!.height)
      .attr('fill', (node: NodeModel) => viz.style.forNode(node).get('color'))

    captions
      .selectAll('text.caption')
      .data((node: NodeModel) => [node])
      .join('text')
      .classed('caption', true)
      .attr('text-anchor', 'middle')
      .attr('pointer-events', 'none')
      .attr('x', 0)
      .attr('y', (node: NodeModel) => node.radius + node.captionText!.height)
      .attr('font-size', (node: NodeModel) => viz.style.forNode(node).get('font-size'))
      .attr('fill', (node: NodeModel) => viz.style.forNode(node).get('text-color-internal'))
      .text((node: NodeModel) => node.captionText!.text)
    
  },
  onTick: noop
})

const arrowPath = new Renderer<RelationshipModel>({
  name: 'arrowPath',

  onGraphChange(selection, viz) {
    return selection
      .selectAll('path.b-outline')
      .data((rel: any) => [rel])
      .join('path')
      .classed('b-outline', true)
      .attr('fill', (rel: any) => viz.style.forRelationship(rel).get('color'))
      .attr('stroke', 'none')
  },

  onTick(selection) {
    return selection
      .selectAll<BaseType, RelationshipModel>('path')
      .attr('d', d => d.arrow!.outline(d.shortCaptionLength ?? 0))
  }
})

const relationshipType = new Renderer<RelationshipModel>({
  name: 'relationshipType',
  onGraphChange(selection, viz) {
    return selection
      .selectAll('text')
      .data(rel => [rel])
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('pointer-events', 'none')
      .attr('font-size', rel => viz.style.forRelationship(rel).get('font-size'))
      .attr('fill', rel =>
        viz.style.forRelationship(rel).get(`text-color-${rel.captionLayout}`)
      )
  },

  onTick(selection, viz) {
    return selection
      .selectAll<BaseType, RelationshipModel>('text')
      .attr('x', rel => rel?.arrow?.midShaftPoint?.x ?? 0)
      .attr(
        'y',
        rel =>
          (rel?.arrow?.midShaftPoint?.y ?? 0) +
          parseFloat(viz.style.forRelationship(rel).get('font-size')) / 2 -
          1
      )
      .attr('transform', rel => {
        if (rel.naturalAngle < 90 || rel.naturalAngle > 270) {
          return `rotate(180 ${rel?.arrow?.midShaftPoint?.x ?? 0} ${
            rel?.arrow?.midShaftPoint?.y ?? 0
          })`
        } else {
          return null
        }
      })
      .text(rel => rel.shortCaption ?? '')
  }
})

const relationshipOverlay = new Renderer<RelationshipModel>({
  name: 'relationshipOverlay',
  onGraphChange(selection) {
    return selection
      .selectAll('path.overlay')
      .data(rel => [rel])
      .join('path')
      .classed('overlay', true)
  },

  onTick(selection) {
    const band = nodeRingStrokeSize * 1.4

    return selection
      .selectAll<BaseType, RelationshipModel>('path.overlay')
      .attr('d', d => d.arrow!.overlay(band))
  }
})

const node = [nodeOutline, nodeOutlineLabel, nodeCaption, nodeRing]

const relationship = [arrowPath, relationshipType, relationshipOverlay]

export { node, relationship }
