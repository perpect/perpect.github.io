class MinHeap {
  constructor(arr = []) { this.h = arr; this.heapify(); }
  heapify() {
    for (let i = Math.floor(this.h.length/2)-1; i>=0; i--) this.down(i);
  }
  size(){ return this.h.length; }
  peak(){ return this.h[0]; }
  push(v){ this.h.push(v); this.up(this.h.length-1); }
  pop (){
    const top = this.h[0], last = this.h.pop();
    if (this.h.length) { this.h[0]=last; this.down(0); }
    return top;
  }
  up(i){
    while(i){
      const p = (i-1)>>1;
      if (this.h[p] <= this.h[i]) break;
      [this.h[p],this.h[i]] = [this.h[i],this.h[p]]; i=p;
    }
  }
  down(i){
    const n=this.h.length;
    while(true){
      let l=i*2+1, r=l+1, s=i;
      if (l<n && this.h[l]<this.h[s]) s=l;
      if (r<n && this.h[r]<this.h[s]) s=r;
      if (s===i) break;
      [this.h[s],this.h[i]]=[this.h[i],this.h[s]]; i=s;
    }
  }
}

class BinarySet {
  constructor(size) {
    this.size = size;      // 최대 비트 수 (0 ~ size-1)
    this.bits = 0n;        // 비트마스크
  }

  #mask(idx) {
    if (idx < 0 || idx >= this.size) throw RangeError("idx out of range");
    return 1n << BigInt(idx);
  }

  add(idx)    { this.bits |=  this.#mask(idx); }
  delete(idx) { this.bits &= ~this.#mask(idx); }
  has(idx)    { return (this.bits & this.#mask(idx)) !== 0n; }
  clear()     { this.bits = 0n; }

  get count() {
    // Hamming weight(popcount) for BigInt
    let n = this.bits, c = 0;
    while (n) { c += Number(n & 1n); n >>= 1n; }
    return c;
  }

  *values() {
    for (let i = 0; i < this.size; i++)
      if (this.has(i)) yield i;
  }

  toString() {
    return [...this.values()].join(",");
  }
}