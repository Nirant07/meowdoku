(() => {
  "use strict";

  const N = 7;
  const DIFFICULTY = {easy: 8, medium: 12, hard: 16};
  const palette = ["#f9c6c9","#c8d8f5","#c9e7c0","#f6d59d","#d9c8ef","#bfe4df","#f1c4a8"];

  const boardEl = document.getElementById("board");
  const difficultyEl = document.getElementById("difficulty");
  const difficultyLabel = document.getElementById("difficultyLabel");
  const movesEl = document.getElementById("moves");
  const messageEl = document.getElementById("message");

  let solution = [], regions = [], givens = [], player = [], moves = 0, locked = false;

  function shuffle(a) {
    for (let i=a.length-1;i>0;i--) {
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }

  // Generate a permutation with no adjacent cats (including diagonals).
  function makeSolution() {
    const rows = Array.from({length:N},(_,i)=>i);
    const candidates = Array.from({length:N},()=>[]);
    for(let r=0;r<N;r++) {
      candidates[r]=shuffle(Array.from({length:N},(_,c)=>c));
    }
    const out = Array(N).fill(-1);
    function dfs(r, used) {
      if(r===N) return true;
      const choices = shuffle(candidates[r].filter(c=>!used.has(c)));
      for(const c of choices) {
        if(r>0 && Math.abs(c-out[r-1])<=1) continue;
        out[r]=c; used.add(c);
        if(dfs(r+1,used)) return true;
        used.delete(c); out[r]=-1;
      }
      return false;
    }
    // Retry if random search happens to fail.
    for(let tries=0;tries<200;tries++){
      out.fill(-1);
      if(dfs(0,new Set())) return out.slice();
      for(let r=0;r<N;r++) candidates[r]=shuffle(Array.from({length:N},(_,c)=>c));
    }
    return [0,2,4,6,1,3,5]; // valid fallback
  }

  // Create exactly N connected colour regions.
  // Each region starts at the solution cat in its row and grows through
  // neighbouring cells, so one colour can never split into separate clusters.
  function makeRegions(sol) {
    const total = N * N;
    const reg = Array(total).fill(-1);
    const seeds = sol.map((c, r) => r * N + c);

    // Start every region at its unique solution-cat cell.
    seeds.forEach((idx, k) => reg[idx] = k);

    const frontier = Array.from({length:N}, () => new Set());

    function neighbours(idx) {
      const r = Math.floor(idx / N), c = idx % N;
      const out = [];
      if (r > 0) out.push(idx - N);
      if (r < N - 1) out.push(idx + N);
      if (c > 0) out.push(idx - 1);
      if (c < N - 1) out.push(idx + 1);
      return out;
    }

    function refreshFrontier(k) {
      frontier[k].clear();
      for (let i = 0; i < total; i++) {
        if (reg[i] !== k) continue;
        for (const n of neighbours(i)) {
          if (reg[n] === -1) frontier[k].add(n);
        }
      }
    }

    for (let k = 0; k < N; k++) refreshFrontier(k);

    let remaining = reg.filter(x => x === -1).length;

    while (remaining > 0) {
      const active = [];
      for (let k = 0; k < N; k++) {
        if (frontier[k].size) active.push(k);
      }

      if (!active.length) break;

      // Prefer regions with fewer cells so region sizes stay reasonably balanced.
      const sizes = Array(N).fill(0);
      reg.forEach(x => { if (x >= 0) sizes[x]++; });
      active.sort((a,b) => sizes[a] - sizes[b] || Math.random() - 0.5);

      const k = active[0];
      const cells = Array.from(frontier[k]);
      const cell = cells[Math.floor(Math.random() * cells.length)];

      reg[cell] = k;
      remaining--;

      // Only the changed region needs a full frontier refresh; other regions
      // lose this cell from their frontiers if they had it.
      refreshFrontier(k);
      for (let j = 0; j < N; j++) {
        if (j !== k) frontier[j].delete(cell);
      }
    }

    // Defensive fallback: if a cell somehow remains unassigned, attach it to
    // an adjacent region while preserving connectivity.
    for (let i = 0; i < total; i++) {
      if (reg[i] !== -1) continue;
      const ns = neighbours(i).filter(n => reg[n] !== -1);
      reg[i] = ns.length ? reg[ns[0]] : 0;
    }

    return reg;
  }

  function makePuzzle() {
    solution=makeSolution();
    regions=makeRegions(solution);
    player=Array(N*N).fill(false);
    givens=Array(N*N).fill(false);
    moves=0; locked=false;

    // Start with a completely empty board. The regions themselves are the clues.
    // The player places every cat.
    givens = Array(N*N).fill(false);
    player = Array(N*N).fill(false);
    render();
    setMessage("The board is empty. Place all 7 cats.");
  }

  function render() {
    boardEl.innerHTML="";
    for(let i=0;i<N*N;i++){
      const cell=document.createElement("button");
      cell.type="button";
      cell.className="cell";
      cell.dataset.index=i;
      cell.style.background=palette[regions[i]];
      cell.dataset.region = regions[i];
      if(player[i]) cell.classList.add("cat");
      if(givens[i]) cell.classList.add("given");
      cell.setAttribute("aria-label",`Row ${Math.floor(i/N)+1}, column ${i%N+1}, ${player[i]?"cat":"empty"}`);
      if(givens[i]) cell.disabled=true;
      cell.addEventListener("click",()=>toggle(i));
      boardEl.appendChild(cell);
    }
    movesEl.textContent=`${moves} move${moves===1?"":"s"}`;
    difficultyLabel.textContent=difficultyEl.options[difficultyEl.selectedIndex].text;
  }

  function toggle(i) {
    if(locked || givens[i]) return;
    player[i]=!player[i];
    moves++;
    render();
    validateLive();
  }

  function violations() {
    const bad=new Set();
    let rows=0,cols=0,regs=0,touch=0;
    for(let r=0;r<N;r++){
      const ids=[]; for(let c=0;c<N;c++) if(player[r*N+c]) ids.push(r*N+c);
      if(ids.length>1) ids.forEach(x=>bad.add(x));
      if(ids.length!==1) rows++;
    }
    for(let c=0;c<N;c++){
      const ids=[]; for(let r=0;r<N;r++) if(player[r*N+c]) ids.push(r*N+c);
      if(ids.length>1) ids.forEach(x=>bad.add(x));
      if(ids.length!==1) cols++;
    }
    for(let k=0;k<N;k++){
      const ids=[]; for(let i=0;i<N*N;i++) if(regions[i]===k && player[i]) ids.push(i);
      if(ids.length>1) ids.forEach(x=>bad.add(x));
      if(ids.length!==1) regs++;
    }
    for(let r=0;r<N;r++) for(let c=0;c<N;c++) if(player[r*N+c]){
      for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
        if(!dr&&!dc) continue;
        const rr=r+dr,cc=c+dc;
        if(rr>=0&&rr<N&&cc>=0&&cc<N&&player[rr*N+cc]){
          bad.add(r*N+c); bad.add(rr*N+cc); touch++;
        }
      }
    }
    return {bad,rows,cols,regs,touch};
  }

  function validateLive(){
    const v=violations();
    document.querySelectorAll(".cell").forEach((el,i)=>el.classList.toggle("wrong",v.bad.has(i)));
    if(v.bad.size){
      setMessage("There is a conflict. Check the highlighted cats.",false,true);
    } else {
      const placed=player.filter(Boolean).length;
      if(placed===N){ finishCheck(); }
      else setMessage(`${N-placed} cat${N-placed===1?"":"s"} still to place.`);
    }
  }

  function finishCheck(){
    const v=violations();
    const exact = player.filter(Boolean).length === N &&
      player.every((x,i)=>!x || solution[Math.floor(i/N)]===i%N);
    if(v.bad.size===0 && exact){
      locked=true;
      setMessage("Purr-fect! Puzzle solved.",true,false);
    } else {
      setMessage("All cats obey the basic rules, but this is not the generated solution. Try another cell.",false,true);
    }
  }

  function check(){
    const v=violations();
    document.querySelectorAll(".cell").forEach((el,i)=>el.classList.toggle("wrong",v.bad.has(i)));
    if(v.bad.size) setMessage("Some cats break a row, column, region, or touching rule.",false,true);
    else if(player.filter(Boolean).length<N) setMessage("No current conflicts. Keep going.");
    else finishCheck();
  }

  function hint(){
    if(locked) return;
    const missing=[];
    for(let r=0;r<N;r++) if(!player[r*N+solution[r]]) missing.push(r);
    if(!missing.length){
      setMessage("All solution cats are already placed.");
      return;
    }
    const r=missing[Math.floor(Math.random()*missing.length)];
    const i=r*N+solution[r];
    player[i]=true; moves++;
    render();
    const el=boardEl.children[i]; el.classList.add("hinted");
    setMessage(`Hint placed: row ${r+1}, column ${solution[r]+1}.`);
  }

  function clearBoard(){
    for(let i=0;i<N*N;i++) if(!givens[i]) player[i]=false;
    moves++; render(); setMessage("Board cleared. The fixed clues remain.");
  }

  function setMessage(text,good=false,bad=false){
    messageEl.textContent=text;
    messageEl.className="message"+(good?" good":"")+(bad?" bad":"");
  }

  document.getElementById("newGame").addEventListener("click",makePuzzle);
  document.getElementById("check").addEventListener("click",check);
  document.getElementById("hint").addEventListener("click",hint);
  document.getElementById("clear").addEventListener("click",clearBoard);
  difficultyEl.addEventListener("change",makePuzzle);

  makePuzzle();
})();
