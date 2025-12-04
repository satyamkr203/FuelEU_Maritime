# AI Agent Workflow Log

This document shows how I used AI agents (Cursor and ChatGPT) to build this project.

---

## Agents Used

* **Cursor** - Main tool for code generation and refactoring
* **ChatGPT** - Used for explaining concepts and debugging

---

## Prompts & Outputs

### Example 1: Setting Up the Project Structure

**My Prompt:**
```
Create a hexagonal architecture structure for FuelEU Maritime project.
Backend: Node.js + TypeScript + Express + Prisma
Frontend: React + TypeScript + Vite + TailwindCSS
Separate core, adapters, and infrastructure layers
```

**What Cursor Generated:**
It created the entire folder structure:
- `backend/src/core/` with domain, application, ports folders
- `backend/src/adapters/` with inbound/http and outbound/prisma
- `frontend/src/core/` and `frontend/src/adapters/` with similar structure

**What I Did:**
I reviewed it and it looked good. The structure was clean and followed hexagonal architecture correctly.

---

### Example 2: API Endpoint Connection Issues (Frontend-Backend)

**The Problem:**
I kept having issues connecting the frontend to backend. The API calls weren't working, and I was getting CORS errors and 404s.

**My Prompt to Cursor:**
```
The frontend can't connect to the backend API. I'm getting CORS errors.
Backend runs on localhost:4000, frontend on localhost:5173.
Help me fix the API client setup.
```

**What Cursor Generated:**
```typescript
// apiClient.ts
const API_BASE_URL = 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**The Issue:**
Cursor's code was mostly right, but I forgot to check:
1. The backend CORS was enabled (it was)
2. The endpoint paths matched exactly
3. I was calling the right HTTP methods

**What I Fixed:**
I had to manually check each endpoint:
- Backend: `GET /routes` 
- Frontend: I was calling `/api/routes` (wrong!)

I asked ChatGPT: "Why is my frontend getting 404 on API calls?"

ChatGPT explained: "Check if your API client has the right base URL and if your endpoints match exactly."

**Final Fix:**
I updated the API calls to match the backend exactly:
```typescript
// Before (wrong)
apiClient.get('/api/routes')

// After (correct)
apiClient.get('/routes')
```

---

### Example 3: Forgetting to Use JSON for Clean UI

**The Problem:**
I was displaying raw JSON data directly in the UI instead of formatting it nicely.

**My Original Code:**
```typescript
<div>
  <pre>{JSON.stringify(data, null, 2)}</pre>
</div>
```

**My Prompt to Cursor:**
```
The Banking page shows raw JSON. Make it look better with proper formatting.
Show cbBefore, applied, cbAfter in a nice card layout.
```

**What Cursor Generated:**
```typescript
<div className="bg-white p-4 rounded shadow-sm">
  <h3 className="font-medium">CB Snapshot</h3>
  <div className="grid grid-cols-3 gap-4 mt-2">
    <div>
      <p className="text-sm text-gray-600">CB Before</p>
      <p className="text-lg font-semibold">{data.cbBefore}</p>
    </div>
    <div>
      <p className="text-sm text-gray-600">Applied</p>
      <p className="text-lg font-semibold">{data.applied || 0}</p>
    </div>
    <div>
      <p className="text-sm text-gray-600">CB After</p>
      <p className="text-lg font-semibold">{data.cbAfter}</p>
    </div>
  </div>
</div>
```

**What I Did:**
I used Cursor's suggestion but kept the JSON view for debugging. I added a toggle to switch between formatted view and raw JSON.

---

### Example 4: GitHub Merge Conflicts

**The Problem:**
I kept getting merge conflicts when pushing to GitHub, especially in:
- `package.json` files
- API endpoint files
- Component files

**My Prompt to ChatGPT:**
```
I'm getting merge conflicts in GitHub. How do I resolve them properly?
The conflicts are in package.json and some TypeScript files.
```

**What ChatGPT Explained:**
1. Pull latest changes first
2. Resolve conflicts locally
3. Test before pushing
4. Use `git merge` or `git rebase` carefully

**What I Did:**
I started using:
```bash
git pull origin main
# Resolve conflicts
git add .
git commit -m "Resolved merge conflicts"
git push
```

But I still had issues because I was working on multiple features at once.

**Better Approach (What I Learned):**
I should have:
1. Made smaller, focused commits
2. Pushed more frequently
3. Used feature branches instead of working directly on main

---

### Example 5: Creating the Compliance Balance Calculation

**My Prompt to Cursor:**
```
Create a function to calculate Compliance Balance (CB).
Formula: CB = (TARGET - ACTUAL) × ENERGY
TARGET = 89.3368 gCO2e/MJ
ENERGY = fuelTons × 41000 MJ/t
```

**What Cursor Generated:**
```typescript
export const TARGET_INTENSITY = 89.3368;
export const MJ_PER_TONNE = 41000;

export function computeCB(ghgIntensity: number, fuelTons: number): number {
  const energyMJ = fuelTons * MJ_PER_TONNE;
  const cb = (TARGET_INTENSITY - ghgIntensity) * energyMJ;
  return cb;
}
```

**What I Did:**
This was perfect! I used it directly. No changes needed.

---

### Example 6: Pooling Algorithm

**My Prompt:**
```
Create a pooling algorithm that:
1. Validates sum of CB >= 0
2. Sorts surpluses and deficits
3. Transfers from surpluses to deficits
4. Ensures no ship exits worse
```

**What Cursor Generated:**
The algorithm was mostly correct, but it missed some edge cases:
- What if all ships have surplus?
- What if sum is exactly 0?

**What I Fixed:**
I added validation:
```typescript
if (total < 0) {
  return res.status(400).json({ error: "Sum must be >= 0" });
}
```

And I tested with different scenarios to make sure it worked.

---

## Validation / Corrections

### How I Verified Agent Output

1. **Manual Testing**
   - I ran the code and tested each feature
   - Checked if API calls worked
   - Verified calculations were correct

2. **Code Review**
   - Read through the generated code
   - Checked if it followed the architecture
   - Made sure dependencies were correct

3. **Incremental Changes**
   - I didn't accept everything at once
   - Tested small pieces before moving on
   - Fixed issues as they came up

### Common Corrections I Made

1. **API Endpoints**
   - Cursor sometimes generated wrong paths
   - I had to manually check backend routes
   - Fixed mismatches between frontend and backend

2. **TypeScript Types**
   - Cursor used `any` too often
   - I replaced them with proper types
   - Created interfaces for better type safety

3. **Error Handling**
   - Generated code sometimes missed error cases
   - I added try-catch blocks
   - Added proper error messages

4. **UI Formatting**
   - I forgot to format JSON data nicely
   - Added proper UI components
   - Made data more readable

---

## Observations

### Where Agents Saved Time

1. **Project Setup**
   - Creating folder structure: Saved 2-3 hours
   - Setting up Prisma schema: Saved 1-2 hours
   - Creating basic components: Saved 3-4 hours

2. **Boilerplate Code**
   - Express controllers: Saved 2 hours
   - React components: Saved 3 hours
   - API client setup: Saved 1 hour

3. **Complex Logic**
   - CB calculation: Saved 1 hour
   - Pooling algorithm: Saved 2-3 hours
   - Banking logic: Saved 1-2 hours

**Total Time Saved: ~15-20 hours**

### Where Agents Failed or Hallucinated

1. **API Endpoint Paths**
   - Generated wrong paths sometimes
   - I had to manually check and fix
   - This caused connection issues

2. **Merge Conflicts**
   - Agents couldn't help with Git conflicts
   - I had to resolve manually
   - Should have used branches better

3. **UI Formatting**
   - I forgot to format JSON properly
   - Had to go back and fix it
   - Should have asked for formatted UI from the start

4. **Type Safety**
   - Used `any` types too much
   - Had to add proper types later
   - Should have been more specific in prompts

### How I Combined Tools Effectively

1. **Cursor for Structure**
   - Used Cursor to create project structure
   - Generated boilerplate code
   - Created initial components

2. **ChatGPT for Explanations**
   - Asked ChatGPT when I didn't understand something
   - Got help with merge conflicts
   - Explained concepts I was confused about

3. **Manual Review**
   - Always reviewed generated code
   - Tested everything manually
   - Fixed issues as they came up

---

## Best Practices Followed

### 1. Incremental Development

I didn't try to build everything at once. I:
- Built one feature at a time
- Tested each feature before moving on
- Committed changes frequently (well, tried to!)

### 2. Specific Prompts

**Bad:**
> "Create a banking page"

**Good:**
> "Create a Banking page component in frontend/src/adapters/ui/pages/ that:
> - Uses the useBanking hook
> - Shows CB snapshot with cbBefore, applied, cbAfter
> - Has input fields for shipId, year, amount
> - Has Bank and Apply buttons
> - Uses TailwindCSS for styling"

### 3. Code Review

I always:
- Read through generated code
- Checked if it made sense
- Tested it before accepting
- Fixed issues immediately

### 4. Architecture Consistency

I made sure:
- Business logic stayed in `core/`
- Adapters handled connections
- No framework code in core
- Interfaces defined in ports

### 5. Error Handling

I added:
- Try-catch blocks where needed
- Proper error messages
- Validation for user inputs
- Error states in UI

---

## Lessons Learned

### What I'd Do Differently

1. **Use Feature Branches**
   - Work on separate branches
   - Merge to main after testing
   - Avoid merge conflicts

2. **Be More Specific with Prompts**
   - Include exact file paths
   - Specify architecture requirements
   - Mention formatting needs upfront

3. **Test API Connections Early**
   - Test frontend-backend connection first
   - Verify endpoints match
   - Check CORS settings

4. **Format UI from the Start**
   - Don't use raw JSON
   - Create proper components
   - Make it user-friendly

5. **Commit More Often**
   - Small, focused commits
   - Push frequently
   - Avoid large merge conflicts

---

## Conclusion

AI agents (Cursor and ChatGPT) helped me build this project much faster. They were great for:
- Creating structure
- Generating boilerplate
- Explaining concepts
- Writing complex algorithms

But I still needed to:
- Review and test everything
- Fix connection issues
- Handle merge conflicts
- Format UI properly

The key was using AI as a helper, not a replacement. I stayed in control and made sure everything worked correctly.

---

*This workflow log shows my real experience using AI agents. It wasn't perfect, but it was effective!*

