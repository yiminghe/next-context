<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [next-context/middleware](./next-context_middleware.md) &gt; [HeaderContext](./next-context_middleware.headercontext.md)

## HeaderContext interface

header middleware context

**Signature:**

```typescript
export interface HeaderContext extends ContextPayload 
```
**Extends:** [ContextPayload](./next-context_middleware.contextpayload.md)

## Properties

<table><thead><tr><th>

Property


</th><th>

Modifiers


</th><th>

Type


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

[req](./next-context_middleware.headercontext.req.md)


</td><td>


</td><td>

{ nextUrl: NextURL; url: string; cookies: [ReadonlyKV](./next-context_middleware.readonlykv.md)<!-- -->; headers: [ReadonlyKV](./next-context_middleware.readonlykv.md)<!-- -->; header: (name: string, value: string) =&gt; void; }


</td><td>


</td></tr>
<tr><td>

[res](./next-context_middleware.headercontext.res.md)


</td><td>


</td><td>

{ end: (response: NextResponse) =&gt; void; }


</td><td>


</td></tr>
</tbody></table>
