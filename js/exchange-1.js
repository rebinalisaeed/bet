function calcExchange(){
        const v = Number(document.getElementById('coinAmount').value || 0);
        document.getElementById('diamondResult').textContent = '💎 ' + Math.floor(v / 100);
      }
