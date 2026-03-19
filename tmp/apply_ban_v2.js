const fs = require('fs');
const path = 'c:\\Users\\BABSK\\Downloads\\PUBG\\app\\profile\\page.tsx';
let c = fs.readFileSync(path, 'utf8');

const target1 = 'onClick={() => setIsDeleteConfirmOpen(true)}';
const replacement1 = `onClick={() => {
                                              if (userTeam.status === 'blocked') {
                                                 setToast({ message: "დაბლოკილი გუნდის წაშლა შეუძლებელია", type: 'error' })
                                              } else {
                                                 setIsDeleteConfirmOpen(true)
                                              }
                                           }}`;

c = c.replace(target1, replacement1);

const target2 = 'className="h-14 w-14 rounded-2xl border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-colors"';
const replacement2 = `disabled={userTeam.status === 'blocked'}
                                           variant="outline"
                                           className={\`h-14 w-14 rounded-2xl border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-colors \${userTeam.status === 'blocked' ? 'opacity-50 cursor-not-allowed border-rose-500/10' : ''}\`}`;

// Wait, the target2 might have more lines in between actually in some versions.
// Let's just do a more partial replace for the className.
c = c.replace('className="h-14 w-14 rounded-2xl border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-colors"', 
   'disabled={userTeam.status === \'blocked\'} className={`h-14 w-14 rounded-2xl border-rose-500/20 text-rose-500 hover:bg-rose-500/10 transition-colors ${userTeam.status === \'blocked\' ? \'opacity-50 cursor-not-allowed border-rose-500/10\' : \'\'}`}'
);

const target3 = `                                     </div>
                                  </div>`;
const replacement3 = `                                     </div>
                                     
                                     {userTeam.status === 'blocked' && (
                                        <div className="mt-8 p-6 rounded-3xl bg-rose-500/5 border border-rose-500/20 animate-reveal">
                                           <div className="flex items-center gap-4 mb-3">
                                              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                                                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                                              </div>
                                              <div>
                                                 <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest italic leading-none mb-1">გუნდი დისკვალიფიცირებულია</div>
                                                 <div className="text-xs font-bold text-white uppercase italic tracking-tight">SUSPENSION_ACTIVE</div>
                                              </div>
                                           </div>
                                           <div className="grid grid-cols-2 gap-4">
                                              <div className="space-y-1">
                                                 <div className="text-[9px] font-black text-white/30 uppercase tracking-widest italic">მიზეზი</div>
                                                 <div className="text-[11px] text-white font-bold italic">{userTeam.ban_reason || "წესების დარღვევა"}</div>
                                              </div>
                                              <div className="space-y-1">
                                                 <div className="text-[9px] font-black text-white/30 uppercase tracking-widest italic">ვადა</div>
                                                 <div className="text-[11px] text-rose-400 font-bold italic">
                                                    {userTeam.ban_until 
                                                      ? new Intl.DateTimeFormat('ka-GE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(userTeam.ban_until)) 
                                                      : "სამუდამოდ"}
                                                 </div>
                                              </div>
                                           </div>
                                        </div>
                                     )}
                                  </div>`;

c = c.replace(target3, replacement3);

fs.writeFileSync(path, c);
console.log('Done!');
