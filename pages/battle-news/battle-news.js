import { apiGet } from '../../utils/util.js';

// pages/battle-news/battle-news.js
Page({

  /**
   * Page initial data
   */
  data: {
    canvasWidth: 300, // Initial width, will be updated
    legends: [],
    chartImage: ''
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {
    this.initChart();
  },

  async initChart() {
    try {
      const rawData = await apiGet('min-combat-power');
      const processedData = this.processData(rawData);
      
      // Set legends
      const legends = processedData.series.map(s => ({
        name: s.name,
        color: s.color
      }));
      this.setData({ legends });
  
      // Calculate canvas width
      const pointSpacing = 60; // Increased spacing for better scrolling
      const paddingLeft = 40;
      const paddingRight = 40;
      const minWidth = 350;
      const requiredWidth = processedData.xAxis.length * pointSpacing + paddingLeft + paddingRight;
      const canvasWidth = Math.max(minWidth, requiredWidth);
      console.log('Calculated Canvas Width:', canvasWidth);
  
      this.setData({ canvasWidth }, () => {
        // Delay drawing to ensure the view has updated with the new width
        // Increased delay to 300ms for better IDE compatibility
        setTimeout(() => {
          this.drawChart(processedData, canvasWidth, pointSpacing, paddingLeft);
        }, 300);
      });
    } catch (error) {
      console.error('Failed to fetch battle data:', error);
      wx.showToast({
        title: '获取数据失败',
        icon: 'none'
      });
    }
  },

  processData(data) {
    // Filter for '稳定' mode only
    const stableData = data.filter(item => item.level_mode === '稳定');

    // 1. Extract unique numeric levels for X-axis
    const levelsSet = new Set();
    stableData.forEach(item => {
      const num = parseInt(item.level_number.split('_')[0]);
      if (!isNaN(num)) levelsSet.add(num);
    });
    const xAxis = Array.from(levelsSet).sort((a, b) => a - b);

    // 2. Define colors for types
    const colorMap = {
      "光": "#FFD700",   // Gold
      "冰": "#00BFFF",   // Deep Sky Blue
      "火": "#FF4500",   // Orange Red
      "能量": "#9370DB", // Medium Purple
      "引力": "#808080", // Gray
      "开放": "#32CD32"  // Lime Green
    };

    // 3. Group data into series by TYPE only
    const seriesMap = {};
    
    stableData.forEach(item => {
      const num = parseInt(item.level_number.split('_')[0]);
      const type = item.level_type;
      
      if (!seriesMap[type]) {
        seriesMap[type] = {
          name: type,
          color: colorMap[type] || '#ffffff',
          dataPoints: {} // Map level -> max_cp
        };
      }

      // Logic: Combine Up/Down, take the HIGHEST CP as the requirement
      const currentMax = seriesMap[type].dataPoints[num] || 0;
      if (item.min_cp > currentMax) {
        seriesMap[type].dataPoints[num] = item.min_cp;
      }
    });

    const series = Object.values(seriesMap).map(s => {
      const points = xAxis.map(x => {
        return s.dataPoints[x] !== undefined ? s.dataPoints[x] : null;
      });
      return {
        ...s,
        data: points
      };
    });

    // 4. Calculate Y-axis range
    let minCp = Infinity;
    let maxCp = -Infinity;
    series.forEach(s => {
      s.data.forEach(cp => {
        if (cp !== null) {
            if (cp < minCp) minCp = cp;
            if (cp > maxCp) maxCp = cp;
        }
      });
    });

    // Padding
    minCp = Math.max(0, minCp - 5000);
    maxCp = maxCp + 5000;

    return { xAxis, series, minCp, maxCp };
  },

  drawChart(data, canvasWidth, pointSpacing, paddingLeft) {
    const query = wx.createSelectorQuery();
    query.select('#cpChart')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;
        
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio;
        
        // FIX: Use the calculated 'canvasWidth' directly. 
        // Reading res[0].width from DOM can be unreliable if the layout update lags.
        const renderHeight = res[0].height || 300; // Fallback height

        canvas.width = canvasWidth * dpr;
        canvas.height = renderHeight * dpr;
        ctx.scale(dpr, dpr);

        const width = canvasWidth; // Use the explicit calculated width
        const height = renderHeight;
        const paddingBottom = 30;
        const paddingTop = 20;

        const plotHeight = height - paddingTop - paddingBottom;
        
        // Helper to map X and Y
        const getX = (index) => paddingLeft + index * pointSpacing;
        const getY = (cp) => {
          const ratio = (cp - data.minCp) / (data.maxCp - data.minCp);
          return height - paddingBottom - (ratio * plotHeight);
        };

        ctx.clearRect(0, 0, width, height);

        // Draw Grid & Y-Axis Labels (Fixed on the left? No, they scroll with canvas for now)
        // Ideally Y-axis stays fixed, but for a simple scroll view, everything scrolls.
        
        ctx.strokeStyle = '#rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        const ySteps = 5;
        for (let i = 0; i <= ySteps; i++) {
          const ratio = i / ySteps;
          const y = height - paddingBottom - (ratio * plotHeight);
          const cpVal = Math.round(data.minCp + ratio * (data.maxCp - data.minCp));
          
          // Draw grid line across the full width
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.moveTo(paddingLeft, y);
          ctx.lineTo(width, y);
          ctx.stroke();

          // Draw label
          const label = (cpVal / 10000).toFixed(1) + 'w';
          ctx.fillText(label, paddingLeft - 5, y);
        }

        // Draw X-Axis Labels
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        data.xAxis.forEach((level, index) => {
          const x = getX(index);
          ctx.fillText(level.toString(), x, height - paddingBottom + 5);
        });

        // Draw Series Lines
        data.series.forEach(s => {
          ctx.beginPath();
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 2;
          ctx.setLineDash([]); // Always solid now

          let first = true;
          s.data.forEach((cp, index) => {
            if (cp !== null) {
              const x = getX(index);
              const y = getY(cp);
              if (first) {
                ctx.moveTo(x, y);
                first = false;
              } else {
                ctx.lineTo(x, y);
              }
            }
          });
          ctx.stroke();

          // Draw points
          ctx.fillStyle = s.color;
          s.data.forEach((cp, index) => {
             if (cp !== null) {
              const x = getX(index);
              const y = getY(cp);
              ctx.beginPath();
              ctx.arc(x, y, 3, 0, Math.PI * 2);
              ctx.fill();
             }
          });
        });

        // Convert to image
        wx.canvasToTempFilePath({
          canvas: canvas,
          x: 0,
          y: 0,
          width: canvasWidth,
          height: renderHeight,
          destWidth: canvasWidth * dpr,
          destHeight: renderHeight * dpr,
          success: (res) => {
            this.setData({ chartImage: res.tempFilePath });
          },
          fail: (err) => {
            console.error('Canvas to temp file path failed:', err);
          }
        });
      });
  },

  onBack() {
    wx.navigateBack();
  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage() {

  }
})